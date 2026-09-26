import { createFileRoute } from "@tanstack/react-router";
import { NetworkPage } from "@/components/am/network";

export const Route = createFileRoute("/_app/network")({
  component: NetworkPage,
  head: () => ({ meta: [{ title: "Network · Action = Matter" }] }),
});
