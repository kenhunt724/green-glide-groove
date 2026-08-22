import { Battery, Container, Home, Truck } from "lucide-react";
import { platforms } from "@/content/energy";
import cartImg from "@/assets/generator-photo.jpg";
import trailerImg from "@/assets/power-trailer.jpg";
import podImg from "@/assets/home-power-pod.jpg";
import containerImg from "@/assets/container-storage.jpg";

const media: Record<string, { src: string; alt: string; icon: typeof Battery }> = {
  cart: {
    src: cartImg,
    alt: "Community-built LiFePO4 generator cart in a steel roll cage with inverter outlet panel",
    icon: Battery,
  },
  trailer: {
    src: trailerImg,
    alt: "Towable enclosed power trailer with LiFePO4 battery rack, inverter and charger",
    icon: Truck,
  },
  pod: {
    src: podImg,
    alt: "Detached backyard home energy pod with battery vault, inverters and rooftop solar",
    icon: Home,
  },
  container: {
    src: containerImg,
    alt: "Shipping-container commercial battery energy storage unit beside a warehouse",
    icon: Container,
  },
};

export function PlatformLadder() {
  return (
    <div className="grid gap-px bg-border md:grid-cols-2">
      {platforms.map((p) => {
        const m = media[p.id];
        const Icon = m?.icon ?? Battery;
        return (
          <article key={p.id} className="flex flex-col bg-background">
            {m ? (
              <img
                src={m.src}
                alt={m.alt}
                loading="lazy"
                width={1536}
                height={1024}
                className="aspect-[3/2] w-full object-cover"
              />
            ) : null}
            <div className="flex flex-1 flex-col p-7">
              <div className="flex items-center justify-between">
                <Icon className="size-6 text-energy" aria-hidden="true" />
                <span className="font-display text-4xl font-bold text-border">{p.step}</span>
              </div>
              <p className="label-mono mt-6 text-energy">{p.scale}</p>
              <h3 className="mt-2 font-display text-xl font-semibold">{p.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              <ul className="mt-6 space-y-2">
                {p.specs.map((s) => (
                  <li key={s} className="flex gap-2 text-sm text-muted-foreground">
                    <span
                      aria-hidden="true"
                      className="mt-[7px] size-1 shrink-0 rounded-full bg-energy"
                    />
                    {s}
                  </li>
                ))}
              </ul>
              <p className="label-mono mt-6 border-t border-border pt-4 text-emerald">{p.who}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
