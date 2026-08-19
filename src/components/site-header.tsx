import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { deepDive } from "@/content/deep-dive";

const wings = [
  { to: "/store", label: "Ultra-Streaming" },
  { to: "/mobility", label: "Mobility" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <a
        href="#main"
        className="label-mono sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:border focus:border-signal focus:bg-background focus:px-3 focus:py-2 focus:text-signal"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link
          to="/"
          className="flex items-baseline gap-3 focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
        >
          <span className="font-display text-base font-bold tracking-tight">
            EARTH PROTECTION SOCIETY
          </span>
          <span className="label-mono hidden sm:inline">Sovereign Works</span>
        </Link>

        <div className="flex items-center gap-6">
          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            {wings.map((w) => (
              <Link
                key={w.to}
                to={w.to}
                className="label-mono transition-colors hover:text-signal focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
                activeProps={{ className: "text-signal", "aria-current": "page" }}
              >
                {w.label}
              </Link>
            ))}
          </nav>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label={open ? "Close deep-dive menu" : "Open deep-dive menu"}
              aria-expanded={open}
              aria-controls="deep-dive-panel"
              className="flex size-11 items-center justify-center border border-border bg-surface text-foreground transition-colors hover:border-signal hover:text-signal focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
            >
              {open ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </SheetTrigger>
            <SheetContent
              id="deep-dive-panel"
              side="right"
              aria-label="Deep dive systems index"
              className="w-full overflow-y-auto border-l border-border bg-background p-0 sm:max-w-lg"
            >
              <SheetHeader className="border-b border-border px-6 py-5">
                <SheetTitle className="font-display text-lg">Deep Dive</SheetTitle>
                <SheetDescription className="label-mono">
                  Systems index / rev 2026.08. Use Tab to move, Enter or Space to expand a brief,
                  Escape to close.
                </SheetDescription>
              </SheetHeader>

              <nav aria-label="Wings" className="flex flex-col border-b border-border">
                {wings.map((w) => (
                  <Link
                    key={w.to}
                    to={w.to}
                    onClick={() => setOpen(false)}
                    activeProps={{ "aria-current": "page" }}
                    className="border-b border-border/60 px-6 py-4 font-display text-xl transition-colors last:border-0 hover:bg-surface hover:text-signal focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
                  >
                    {w.label}
                  </Link>
                ))}
              </nav>

              <Accordion type="single" collapsible className="px-6 py-2">
                {deepDive.map((section) => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="min-h-11 text-left font-display text-base hover:text-signal hover:no-underline focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none">
                      {section.title}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                      <p>{section.summary}</p>
                      <ul className="space-y-1.5">
                        {section.points.map((p) => (
                          <li key={p} className="flex gap-2">
                            <span
                              aria-hidden="true"
                              className="mt-[7px] size-1 shrink-0 rounded-full bg-signal"
                            />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        to="/about"
                        hash={section.id}
                        onClick={() => setOpen(false)}
                        className="label-mono inline-flex min-h-11 items-center text-signal focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
                      >
                        Read full brief on {section.title}
                        <span aria-hidden="true"> →</span>
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
