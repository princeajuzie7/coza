"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRightIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { postCheckIn, type CheckInReceipt } from "@/actions/check-in";
import { ChoiceField } from "@/components/fields/choice-field";
import {
  SelectField,
  type SelectFieldItem,
} from "@/components/fields/select-field";
import { SwitchField } from "@/components/fields/switch-field";
import { PhoneNumberField } from "@/components/fields/phone-number-field";
import { TextField } from "@/components/fields/text-field";
import { StubClock } from "@/components/live-clock";
import { STAMP_IMPACT, Stamp } from "@/components/stamp";
import { Button } from "@/components/ui/button";
import { BUS_TERMINALS, NO_BUS, STANDINGS, WORKFORCE_UNITS } from "@/constant";
import {
  ATTENDANCE_MODE_LABEL,
  GROUP_LABEL,
  GROUP_STYLE,
  STATUS_STYLE,
  type AttendeeGroup,
} from "@/lib/attendance";
import { DEFAULT_COUNTRY } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { Body, FieldGroup, Perforation, Stub, TicketShell } from "./_shared";
import { fieldsSchemaFor, type CheckInFields } from "./_schemas";

const UNIT_ITEMS: SelectFieldItem[] = WORKFORCE_UNITS.map((unit) => ({
  value: unit,
  label: unit,
}));

const TERMINAL_ITEMS: SelectFieldItem[] = [
  { value: NO_BUS, label: "I came on my own" },
  ...BUS_TERMINALS.map((terminal, i) => ({
    value: terminal,
    label: terminal,
    separatorBefore: i === 0,
  })),
];

const EMPTY: CheckInFields = {
  fullName: "",
  phone: { number: "", countryCode: DEFAULT_COUNTRY },
  email: "",
  standing: "" as CheckInFields["standing"],
  busTerminal: "",
  unit: "",
  online: false,
};

export function CheckInForm({ group }: { group: AttendeeGroup }) {
  const [receipt, setReceipt] = React.useState<CheckInReceipt | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckInFields>({
    resolver: zodResolver(fieldsSchemaFor(group)),
    defaultValues: EMPTY,
  });

  const isWorkforce = group === "workforce";
  // useWatch, not watch(): subscribes to this one field and stays memoizable.
  const online = useWatch({ control, name: "online" });

  const onSubmit = handleSubmit(async (fields) => {
    const { data, error } = await postCheckIn(group, fields);
    if (error) {
      toast.error(error);
      return;
    }
    setReceipt(data);
  });

  if (receipt) {
    return (
      <TicketShell group={group}>
        <Stamped
          receipt={receipt}
          onAgain={() => {
            reset(EMPTY);
            setReceipt(null);
          }}
        />
      </TicketShell>
    );
  }

  return (
    <TicketShell group={group}>
      <Stub group={group}>
        {/* The clock stops the moment you submit — the time has been taken. */}
        <StubClock group={group} frozen={isSubmitting} />
      </Stub>
      <Perforation />

      <Body>
        <form onSubmit={onSubmit} className="space-y-8">
          <FieldGroup title="Your details">
            <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
              <div className={isWorkforce ? undefined : "sm:col-span-2"}>
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="fullName"
                      label="Full name"
                      placeholder="Grace Adeyemi"
                      autoComplete="name"
                      autoCapitalize="words"
                      error={errors.fullName?.message}
                    />
                  )}
                />
              </div>

              {isWorkforce && (
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      id="unit"
                      label="Unit"
                      placeholder="Which unit do you serve in?"
                      items={UNIT_ITEMS}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.unit?.message}
                    />
                  )}
                />
              )}

              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneNumberField
                    {...field}
                    id="phone"
                    label="Phone number"
                    error={
                      errors.phone?.number?.message ?? errors.phone?.message
                    }
                    helpText="How we recognise you next Sunday."
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="email"
                    type="email"
                    inputMode="email"
                    label="Email"
                    hint="optional"
                    placeholder="grace@email.com"
                    autoComplete="email"
                    autoCapitalize="none"
                    error={errors.email?.message}
                    helpText="Leave blank if there is none — we will call instead."
                  />
                )}
              />
            </div>
          </FieldGroup>

          <FieldGroup title="This morning">
            <Controller
              name="standing"
              control={control}
              render={({ field }) => (
                <ChoiceField
                  id="standing"
                  label="Are you"
                  options={STANDINGS}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  error={errors.standing?.message}
                />
              )}
            />

            {!isWorkforce && (
              <Controller
                name="online"
                control={control}
                render={({ field }) => (
                  <SwitchField
                    id="online"
                    label="Joining online"
                    helpText={
                      field.value
                        ? "Worshipping with us on eChurch from wherever you are."
                        : "Turn on if you are watching eChurch instead of coming in."
                    }
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            )}

            {!online && (
              <Controller
                name="busTerminal"
                control={control}
                render={({ field }) => (
                  <SelectField
                    id="busTerminal"
                    label="Boarding point"
                    placeholder="Where did you board?"
                    items={TERMINAL_ITEMS}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.busTerminal?.message}
                    helpText="Pick “I came on my own” if you drove, walked or took a taxi."
                  />
                )}
              />
            )}
          </FieldGroup>

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "group h-13 w-full rounded-xl text-[15px] font-bold tracking-tight",
                GROUP_STYLE[group].surface,
                GROUP_STYLE[group].ink,
                "hover:opacity-90",
              )}
            >
              {isSubmitting
                ? "Recording…"
                : `Check in as ${GROUP_LABEL[group].toLowerCase()}`}
              <ArrowUpRightIcon className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
            <p className="text-muted-foreground/70 text-center text-[11px]">
              Your arrival time is taken from the clock at the moment you
              submit.
            </p>
          </div>
        </form>
      </Body>
    </TicketShell>
  );
}

function Stamped({
  receipt,
  onAgain,
}: {
  receipt: CheckInReceipt;
  onAgain: () => void;
}) {
  const status = STATUS_STYLE[receipt.punctuality];
  const firstName = receipt.fullName.split(" ")[0];
  const standing =
    STANDINGS.find((s) => s.value === receipt.standing)?.label ??
    receipt.standing;
  const boarded =
    receipt.busTerminal === NO_BUS ? "Own transport" : receipt.busTerminal;
  const reduceMotion = useReducedMotion();

  // The card takes the hit: one compression keyed to the stamp's impact. This is
  // what sells the stamp as a physical object rather than an element fading in.
  const recoil = reduceMotion
    ? undefined
    : {
        animate: { scale: [1, 0.985, 1] },
        transition: {
          duration: 0.26,
          delay: STAMP_IMPACT,
          ease: "easeOut" as const,
        },
      };

  // Everything below arrives after the hit, never before it.
  const settle = (index: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.35,
            delay: STAMP_IMPACT + 0.1 + index * 0.05,
            ease: "easeOut" as const,
          },
        };

  return (
    <motion.div {...recoil}>
      <Stub group={receipt.group}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-60">
              Recorded at
            </p>
            <p className="mt-1.5 font-mono text-[clamp(2.2rem,11vw,3.4rem)] leading-none font-semibold tracking-tighter uppercase tabular-nums">
              {receipt.at}
            </p>
            <p className="mt-2.5 text-[13px] font-medium opacity-70">
              {receipt.date}
            </p>
          </div>

          <Stamp label={status.label} className="mt-1" />
        </div>
      </Stub>

      <Perforation />

      <Body>
        <div className="space-y-8">
          <motion.header className="space-y-2" {...settle(0)}>
            <h1 className="text-[clamp(1.9rem,6vw,2.6rem)] leading-[1.02] font-extrabold tracking-tight">
              You&rsquo;re in, {firstName}.
            </h1>
            <p className="text-muted-foreground text-[15px]">
              {receipt.fullName} is on today&rsquo;s{" "}
              {GROUP_LABEL[receipt.group].toLowerCase()} register.
            </p>
          </motion.header>

          {/* The printed half of a stub: mono, uppercase, dotted leaders.
              A four-column grid of micro-labels is a dashboard; this is a pass. */}
          <motion.dl className="border-border border-t pt-5" {...settle(1)}>
            <Line label="Status">
              <span
                className={cn("inline-flex items-center gap-2", status.text)}
              >
                <span className={cn("size-1.5 rounded-full", status.dot)} />
                {status.label}
              </span>
            </Line>
            {receipt.unit && <Line label="Unit">{receipt.unit}</Line>}
            <Line label="Attended">{ATTENDANCE_MODE_LABEL[receipt.mode]}</Line>
            <Line label="Standing">{standing}</Line>
            {receipt.mode === "in_person" && (
              <Line label="Boarded">{boarded}</Line>
            )}
            <Line label="Phone">{receipt.phone}</Line>
          </motion.dl>

          {!receipt.hasEmail && (
            <p className="text-muted-foreground bg-muted flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-xs leading-relaxed">
              <PhoneIcon className="mt-0.5 size-3.5 shrink-0" />
              No email on file — follow-ups for {firstName} go to the call list
              instead.
            </p>
          )}

          <motion.div
            className="flex flex-col gap-2.5 sm:flex-row-reverse sm:items-center"
            {...settle(2)}
          >
            <Button
              onClick={onAgain}
              className={cn(
                "group h-12 flex-1 rounded-xl text-[15px] font-bold tracking-tight hover:opacity-90",
                GROUP_STYLE[receipt.group].surface,
                GROUP_STYLE[receipt.group].ink,
              )}
            >
              Check in someone else
              <ArrowUpRightIcon className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
            {/* nativeButton={false}: this renders an <a>, so Base UI must not assume button semantics. */}
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href="/" />}
              className="text-muted-foreground hover:text-foreground h-12 rounded-xl text-[13px] font-medium sm:px-5"
            >
              Back to start
            </Button>
          </motion.div>
        </div>
      </Body>
    </motion.div>
  );
}

function Line({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-3 py-2.5">
      <dt className="text-muted-foreground/60 shrink-0 font-mono text-[10px] tracking-[0.18em] uppercase">
        {label}
      </dt>
      {/* The leader is decoration, not content — keep it out of the accessibility tree. */}
      <span
        aria-hidden
        className="border-border/80 min-w-5 flex-1 -translate-y-[3px] border-b border-dotted"
      />
      <dd className="shrink-0 font-mono text-[13px] font-semibold tracking-tight uppercase tabular-nums">
        {children}
      </dd>
    </div>
  );
}
