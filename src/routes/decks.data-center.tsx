import { createFileRoute } from "@tanstack/react-router";
import { DeckShell } from "@/components/deck/deck-shell";
import { dataCenterSlides } from "@/components/deck/data-center-slides";

export const Route = createFileRoute("/decks/data-center")({
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
