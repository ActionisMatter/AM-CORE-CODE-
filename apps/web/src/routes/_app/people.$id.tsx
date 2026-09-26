import { createFileRoute } from "@tanstack/react-router";
import { PersonPage } from "@/components/am/person";

export const Route = createFileRoute("/_app/people/$id")({
  component: function PeopleRoute() {
    const { id } = Route.useParams();
    return <PersonPage id={id} />;
  },
});
