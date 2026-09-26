import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/am/home";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
  head: () => ({ meta: [{ title: "Home · Action = Matter" }] }),
});
