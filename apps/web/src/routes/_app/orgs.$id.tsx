import { createFileRoute } from "@tanstack/react-router";
import { OrgPage } from "@/components/am/person";

export const Route = createFileRoute("/_app/orgs/$id")({
  component: function OrgRoute() {
    const { id } = Route.useParams();
    return <OrgPage id={id} />;
  },
});
