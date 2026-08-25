import { Phone } from "lucide-react";

export const CONTACT_PHONE = "404-454-0602";

export function ContactPhone({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light" | "signal";
}) {
  const variantClasses = {
    dark: "text-muted-foreground hover:text-foreground",
    light: "text-background/70 hover:text-background",
    signal: "text-signal hover:text-signal/80",
  };

  return (
    <a
      href={`tel:${CONTACT_PHONE.replace(/-/g, "")}`}
      className={`inline-flex items-center gap-2 font-display text-sm font-semibold transition-colors ${variantClasses[variant]} ${className}`}
    >
      <Phone className="size-4" aria-hidden="true" />
      {CONTACT_PHONE}
    </a>
  );
}
