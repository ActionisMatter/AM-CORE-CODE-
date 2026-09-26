import { createFileRoute } from "@tanstack/react-router";
import { ProjectPage } from "@/components/am/project";

export const Route = createFileRoute("/_app/projects/$id")({
  component: function ProjectRoute() {
    const { id } = Route.useParams();
    return <ProjectPage id={id} />;
  },
});
