import { createFileRoute } from "@tanstack/react-router";
import { OpportunitiesPage } from "@/components/am/opportunities";

export const Route = createFileRoute("/_app/opportunities")({
  component: OpportunitiesPage,
  head: () => ({ meta: [{ title: "Opportunities · Action = Matter" }] }),
});
