import { createFileRoute } from "@tanstack/react-router";
import { ProjectsPage } from "@/components/am/project";

export const Route = createFileRoute("/_app/projects/")({
  component: ProjectsPage,
  head: () => ({ meta: [{ title: "Projects · Action = Matter" }] }),
});
