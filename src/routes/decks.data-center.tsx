import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DeckShell } from "@/components/deck/deck-shell";
import { dataCenterSlides } from "@/components/deck/data-center-slides";

const searchSchema = z.object({
  slide: z.preprocess(
    (v) => (v ? Number(v) : 1),
    z.number().int().min(1).max(100).default(1)
  ),
  print: z.enum(["1", "true"]).optional(),
});

export const Route = createFileRoute("/decks/data-center")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      {
        title: "Free Compute from the Feeder — Data Center Pitch",
      },
      {
        name: "description",
        content:
          "Customer-funded edge compute playbook for data-center operators.",
      },
      {
        property: "og:title",
        content: "Free Compute from the Feeder — Data Center Pitch",
      },
      {
        property: "og:description",
        content:
          "Customer-funded edge compute playbook for data-center operators.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <DeckShell slides={dataCenterSlides} title="Data Center Pitch" />;
}
