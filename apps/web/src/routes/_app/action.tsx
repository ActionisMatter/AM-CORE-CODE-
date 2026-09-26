import { createFileRoute } from "@tanstack/react-router";
import { ActionPage } from "@/components/am/action";

export const Route = createFileRoute("/_app/action")({
  component: ActionPage,
  head: () => ({ meta: [{ title: "Action · Action = Matter" }] }),
});
