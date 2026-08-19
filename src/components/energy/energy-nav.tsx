import { Link } from "@tanstack/react-router";
import { Menu, Zap } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const anchors = [
  { href: "#vaults", label: "Detached Outbuilding Vaults" },
  { href: "#mobile", label: "Mobile Generators" },
  { href: "#calculator", label: "Off-Peak Math" },
  { href: "#hardware", label: "Hardware Tiers" },
];

const ecosystem = [
  {
    to: "/store" as const,
    title: "432Hz Ultra-Streaming Storefronts",
    body: "Uncompressed 432Hz masters and artist consignment shelves.",
  },
  {
    to: "/mobility" as const,
    title: "Brogen E-Axle Glider Fleets",
    body: "Community-built series-hybrid flex-fuel glider trucks.",
  },
  {
    to: "/about" as const,
    title: "Community Technician Apprenticeships",
    body: "Closed-loop urban metabolism, LEED Platinum, local jobs.",
  },
];

export function EnergyNav({ onQuote }: { onQuote: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <a
        href="#main"
        className="label-mono sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:border focus:border-energy focus:bg-background focus:px-3 focus:py-2 focus:text-energy"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
        <Link to="/" className="flex items-center gap-2">
          <Zap className="size-5 text-energy" aria-hidden="true" />
          <span className="font-display text-sm font-bold tracking-tight sm:text-base">
            EARTH PROTECTION SOCIETY
          </span>
          <span className="label-mono hidden lg:inline">Energy Division</span>
        </Link>

        <div className="flex items-center gap-4">
          <nav aria-label="Energy division" className="hidden items-center gap-6 lg:flex">
            {anchors.map((a) => (
              <a
                key={a.href}
                href={a.href}
                className="label-mono transition-colors hover:text-energy focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none"
              >
                {a.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={onQuote}
            className="label-mono hidden min-h-11 items-center bg-energy px-4 font-semibold text-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none sm:inline-flex"
          >
            Get Quote
          </button>

          <Sheet>
            <SheetTrigger
              aria-label="Open Earth Protection Society menu"
              className="flex size-11 items-center justify-center border border-border bg-surface transition-colors hover:border-energy hover:text-energy focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none"
            >
              <Menu className="size-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="w-full border-l border-border bg-background p-0 sm:max-w-md">
              <SheetHeader className="border-b border-border px-6 py-5 text-left">
                <SheetTitle className="font-display text-lg">EPS Ecosystem</SheetTitle>
                <SheetDescription className="label-mono">
                  One block, four wings, one charter.
                </SheetDescription>
              </SheetHeader>

              <nav aria-label="Energy sections" className="flex flex-col border-b border-border lg:hidden">
                {anchors.map((a) => (
                  <a
                    key={a.href}
                    href={a.href}
                    className="border-b border-border/60 px-6 py-4 font-display text-lg transition-colors last:border-0 hover:bg-surface hover:text-energy"
                  >
                    {a.label}
                  </a>
                ))}
              </nav>

              <nav aria-label="Other wings" className="flex flex-col">
                {ecosystem.map((e) => (
                  <Link
                    key={e.to}
                    to={e.to}
                    className="border-b border-border/60 px-6 py-5 transition-colors hover:bg-surface"
                  >
                    <p className="font-display text-lg">{e.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{e.body}</p>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
