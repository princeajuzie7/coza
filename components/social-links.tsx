import { CHURCH } from "@/constant";
import { cn } from "@/lib/utils";

/**
 * svgl ships these as filled badges — Instagram's gradient square, YouTube's red
 * rect, X's solid black glyph — so forcing them monochrome turns them into blocks,
 * and X vanishes outright on a dark footer. They sit on a light chip instead:
 * authentic marks, legible, and only ~18px of colour each.
 */
export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {CHURCH.social.map(({ name, href, icon }) => (
        <li key={name}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            className="grid size-9 place-items-center rounded-full bg-white/85 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={icon} alt="" width={17} height={17} className="size-[17px]" />
          </a>
        </li>
      ))}
    </ul>
  );
}
