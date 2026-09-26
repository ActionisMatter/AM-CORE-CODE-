import { createFileRoute } from "@tanstack/react-router";
import { MePage } from "@/components/am/person";

export const Route = createFileRoute("/_app/me")({
  component: MePage,
  head: () => ({ meta: [{ title: "Profile · Action = Matter" }] }),
});
