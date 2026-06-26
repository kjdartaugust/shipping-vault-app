import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({
  href = "/",
  className,
  showText = true,
}: {
  href?: string;
  className?: string;
  showText?: boolean;
}) {
  return (
    <Link href={href} className={cn("group flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center">
        <span className="absolute inset-0 rounded-lg ring-conic opacity-80 blur-[2px] transition group-hover:opacity-100" />
        <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-background">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path
              d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <rect x="9" y="10.5" width="6" height="5" rx="1" stroke="hsl(var(--secure))" strokeWidth="1.5" />
            <path d="M10.5 10.5V9a1.5 1.5 0 013 0v1.5" stroke="hsl(var(--secure))" strokeWidth="1.5" />
          </svg>
        </span>
      </span>
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight">
          Vault<span className="text-primary">Ex</span>
        </span>
      )}
    </Link>
  );
}
