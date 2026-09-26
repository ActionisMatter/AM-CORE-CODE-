import { createFileRoute } from "@tanstack/react-router";
import { AiPage } from "@/components/am/ai";

export const Route = createFileRoute("/_app/ai")({
  component: AiPage,
  head: () => ({ meta: [{ title: "AI · Action = Matter" }] }),
});
