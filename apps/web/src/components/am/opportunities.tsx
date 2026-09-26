import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { Bookmark, ChevronLeft, MapPin, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { matchOpportunity, oppReasons } from "@/lib/am/logic";
import { portrait } from "@/lib/am/photos";
import { skillName } from "@/lib/am/seed";
import { useAM } from "@/lib/am/store";
import { cn } from "@/lib/cn";
import { Avatar, Button, ConnectButton, Href } from "./ui";

function useOppId() {
  const href = useRouterState({ select: (state) => state.location.href });
  return new URL(href, "http://am.local").searchParams.get("opp");
}

export function OpportunitiesPage() {
  const id = useOppId();
  if (id) return <OpportunityDetail id={id} />;
  return <OpportunityList />;
}

function OpportunityList() {
  const data = useAM();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Opportunities</h1>
      <p className="mt-1 text-sm text-muted">Projects, roles, partnerships and collaborations near your skills.</p>
      <ul className="mt-5 space-y-3">
        {data.opportunities.map((opp) => {
          const org = data.orgs.find((item) => item.id === opp.orgId);
          return (
            <li key={opp.id}>
              <Href href={`/opportunities?opp=${opp.id}`} className="block rounded-3xl border border-line bg-card p-4">
                <span className="text-xs font-semibold tracking-widest text-peach-ink">{opp.kind.toUpperCase()}</span>
                <span className="mt-1 block text-lg font-semibold">{opp.title}</span>
                <span className="mt-1 block text-sm text-muted">{org?.name}</span>
                <span className="mt-2 block text-sm">{opp.summary}</span>
                <span className="mt-3 flex flex-wrap gap-2">
                  {(opp.tags ?? opp.skillIds).slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-sand px-3 py-1 text-xs">
                      {tag}
                    </span>
                  ))}
                </span>
              </Href>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function OpportunityDetail({ id }: { id: string }) {
  const data = useAM();
  const router = useRouter();
  const opp = data.opportunities.find((item) => item.id === id);
  const [menu, setMenu] = useState(false);
  if (!opp) return <p className="py-10 text-muted">This opportunity is no longer open.</p>;
  const org = data.orgs.find((item) => item.id === opp.orgId);
  const project = opp.projectId ? data.projects.find((item) => item.id === opp.projectId) : undefined;
  const plan = project ? data.workflows.find((item) => item.projectId === project.id) : undefined;
  const matches = matchOpportunity(data, opp.id, 3);
  const why = oppReasons(data, opp.id);
  const saved = (data.savedOppIds ?? []).includes(opp.id);
  const seeking =
    opp.seeking ??
    opp.skillIds.map((skill) => ({
      personId: opp.leadId,
      label: skillName(skill),
    }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Back" className="grid size-11 place-items-center" onClick={() => void router.history.push("/opportunities")}>
          <ChevronLeft className="size-5" />
        </button>
        <button type="button" aria-label="More" className="grid size-11 place-items-center" onClick={() => setMenu((value) => !value)}>
          <MoreHorizontal className="size-5" />
        </button>
      </div>
      {menu ? (
        <button type="button" className="mb-3 text-sm text-accent" onClick={() => data.openFlow(opp.summary)}>
          Turn this into your own project
        </button>
      ) : null}
      <span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold text-mint-ink">Open</span>
      <h1 className="mt-3 text-3xl font-semibold">{opp.title}</h1>
      {org ? (
        <Link to="/orgs/$id" params={{ id: org.id }} className="mt-3 flex items-center gap-2 text-sm">
          <span className="grid size-8 place-items-center rounded-full bg-accent text-xs font-bold text-on-accent">{org.name.slice(0, 1)}</span>
          <span>
            <span className="block text-xs text-muted">{org.kind}</span>
            <span className="font-medium">{org.name}</span>
          </span>
        </Link>
      ) : null}
      <p className="mt-4 text-sm leading-relaxed">{opp.summary}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {(opp.tags ?? []).map((tag) => (
          <li key={tag} className="rounded-full bg-sand px-3 py-1 text-xs">
            {tag}
          </li>
        ))}
      </ul>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex gap-3">
          <MapPin className="mt-0.5 size-4 text-muted" aria-hidden />
          <div>
            <dt className="text-muted">Location</dt>
            <dd>{opp.location}</dd>
          </div>
        </div>
        <div>
          <dt className="text-muted">Timeline</dt>
          <dd>{opp.timeline}</dd>
        </div>
        <div>
          <dt className="text-muted">Budget</dt>
          <dd>{opp.budget}</dd>
        </div>
        <div>
          <dt className="text-muted">Needs</dt>
          <dd>{opp.skillIds.map((id) => skillName(id)).join(", ")}</dd>
        </div>
      </dl>
      {why.length ? (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Why this is near you</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {why.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {matches.length ? (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Who can help</h2>
          <ul className="mt-3 space-y-3">
            {matches.map((match) => (
              <li key={match.person.id} className="rounded-2xl border border-line bg-card p-3">
                <Link to="/people/$id" params={{ id: match.person.id }} className="flex items-center gap-3">
                  <Avatar name={match.person.name} src={portrait(match.person.id)} size="sm" />
                  <span>
                    <span className="block font-medium">{match.person.name}</span>
                    <span className="block text-sm text-muted">{match.reasons[0]}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {plan ? (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Action plan</h2>
          <ol className="mt-3 space-y-2">
            {plan.steps.map((step, index) => (
              <li key={step.id} className="flex gap-3 rounded-2xl bg-sand px-4 py-3 text-sm">
                <span className="font-semibold text-accent">{index + 1}</span>
                <span>
                  <span className="block font-medium">{step.title}</span>
                  <span className="text-muted">{step.state === "done" ? "Done" : step.state === "now" ? "Now" : "Next"} · {step.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      {project ? (
        <Link to="/projects/$id" params={{ id: project.id }} className="mt-4 block text-sm font-medium text-accent">
          Open {project.name}
        </Link>
      ) : null}
      <h2 className="mt-6 text-lg font-semibold">We are looking for</h2>
      <ul className="mt-3 space-y-3">
        {seeking.map((item) => {
          const person = data.people.find((entry) => entry.id === item.personId);
          return (
            <li key={item.label} className="flex items-center gap-3">
              <Avatar name={person?.name ?? item.label} src={person ? portrait(person.id) : undefined} size="sm" />
              <span className="min-w-0 flex-1 text-sm font-medium">{item.label}</span>
              <ConnectButton personId={item.personId} projectId={opp.projectId} why={`${item.label} for ${opp.title}`} />
            </li>
          );
        })}
      </ul>
      <Button variant="navy" className="mt-6 w-full" onClick={() => data.takeOpportunity(opp.id)}>
        Express Interest
      </Button>
      <button
        type="button"
        className={cn("mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line text-sm font-medium", saved && "bg-sand")}
        onClick={() => {
          data.toggleSave(opp.id);
          data.pushToast(saved ? "Removed from saved." : "Saved.");
        }}
      >
        <Bookmark className="size-4" aria-hidden />
        {saved ? "Saved" : "Save Opportunity"}
      </button>
    </div>
  );
}
