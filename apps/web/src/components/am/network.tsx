import { Link } from "@tanstack/react-router";
import { ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { coverFor, portrait } from "@/lib/am/photos";
import { useAM } from "@/lib/am/store";
import { cn } from "@/lib/cn";
import { useNoticesBell } from "./shell";
import { Avatar, ConnectButton, Href, Mark } from "./ui";

const CHIPS = ["All", "People", "Projects", "Opportunities"] as const;
const LISTS = ["People", "Projects", "Opportunities"] as const;

export function NetworkPage() {
  const data = useAM();
  const bell = useNoticesBell();
  const [chip, setChip] = useState<(typeof CHIPS)[number]>("All");
  const [list, setList] = useState<(typeof LISTS)[number]>("People");
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const featured = data.projects.find((project) => project.id === "citylab");
  const me = data.people.find((person) => person.id === "luke");

  const people = useMemo(
    () =>
      data.people.filter((person) => {
        if (person.id === "luke") return false;
        return !needle || `${person.name} ${person.role} ${person.location}`.toLowerCase().includes(needle);
      }),
    [data.people, needle],
  );
  const projects = data.projects.filter((project) => !needle || project.name.toLowerCase().includes(needle));
  const opps = data.opportunities.filter((opp) => !needle || `${opp.title} ${opp.summary}`.toLowerCase().includes(needle));
  const orgs = data.orgs.filter((org) => org.exposed && (!needle || org.name.toLowerCase().includes(needle)));
  const mode = chip === "All" ? list : chip === "People" ? "People" : chip === "Projects" ? "Projects" : "Opportunities";

  return (
    <div>
      <header className="flex items-center justify-between">
        <Mark />
        <div className="flex items-center gap-1">
          {bell}
          {me ? (
            <Link to="/me" aria-label="Your profile">
              <Avatar name={me.name} src={portrait(me.id)} />
            </Link>
          ) : null}
        </div>
      </header>
      <label className="mt-4 flex min-h-12 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm text-muted">
        <Search className="size-4" aria-hidden />
        <span className="sr-only">Search</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search people, projects, opportunities..."
          className="w-full bg-transparent py-3 text-ink outline-none placeholder:text-muted"
        />
      </label>
      <div className="mt-4 flex gap-2 overflow-x-auto">
        {CHIPS.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={chip === item}
            onClick={() => setChip(item)}
            className={cn("shrink-0 rounded-full px-4 py-2 text-sm", chip === item ? "bg-ink text-on-accent" : "bg-sand text-ink")}
          >
            {item}
          </button>
        ))}
      </div>

      {chip === "All" && featured ? (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Featured</h2>
            <Link to="/projects" className="text-sm text-muted">
              See all
            </Link>
          </div>
          <Link to="/projects/$id" params={{ id: featured.id }} className="block overflow-hidden rounded-3xl border border-line bg-card shadow-card">
            <img src={coverFor(featured.id)} alt="" className="h-36 w-full object-cover" />
            <span className="block p-4">
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="block text-lg font-semibold">{featured.name}</span>
                  <span className="mt-1 block text-sm text-muted">{featured.location}</span>
                </span>
                <ChevronRight className="size-4 text-muted" aria-hidden />
              </span>
              <span className="mt-2 block text-sm text-ink/80">{featured.summary}</span>
              <span className="mt-3 flex flex-wrap gap-2">
                {(featured.tags ?? []).map((tag) => (
                  <span key={tag} className="rounded-full bg-sand px-3 py-1 text-xs">
                    {tag}
                  </span>
                ))}
              </span>
            </span>
          </Link>
        </section>
      ) : null}

      {chip === "All" ? (
        <div className="mt-6 flex gap-4 border-b border-line">
          {LISTS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setList(item)}
              className={cn("min-h-11 border-b-2 text-sm", list === item ? "border-ink font-semibold" : "border-transparent text-muted")}
            >
              {item}
            </button>
          ))}
        </div>
      ) : (
        <h2 className="mt-6 text-lg font-semibold">{mode}</h2>
      )}

      <ul className="mt-3 space-y-3">
        {mode === "People"
          ? people.map((person) => (
              <li key={person.id} className="flex items-center gap-3">
                <Link to="/people/$id" params={{ id: person.id }} className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={person.name} src={portrait(person.id)} />
                  <span className="min-w-0">
                    <span className="block font-semibold">{person.name}</span>
                    <span className="block truncate text-sm text-muted">
                      {person.role}
                      {person.location ? ` · ${person.location.split(",")[0]}` : ""}
                    </span>
                  </span>
                </Link>
                <ConnectButton personId={person.id} why={`${person.role} in the network`} />
              </li>
            ))
          : null}
        {mode === "Projects"
          ? projects.map((project) => (
              <li key={project.id}>
                <Link to="/projects/$id" params={{ id: project.id }} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
                  {coverFor(project.id) ? <img src={coverFor(project.id)} alt="" className="size-14 rounded-xl object-cover" /> : <span className="grid size-14 place-items-center rounded-xl bg-lilac text-xs font-semibold text-lilac-ink">Project</span>}
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{project.name}</span>
                    <span className="block truncate text-sm text-muted">{project.location}</span>
                  </span>
                  <ChevronRight className="size-4 text-muted" aria-hidden />
                </Link>
              </li>
            ))
          : null}
        {mode === "Opportunities"
          ? opps.map((opp) => {
              const org = data.orgs.find((item) => item.id === opp.orgId);
              return (
                <li key={opp.id}>
                  <Href href={`/opportunities?opp=${opp.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
                    <span className="grid size-11 place-items-center rounded-full bg-mint text-xs font-semibold text-mint-ink">Opp</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{opp.title}</span>
                      <span className="block truncate text-sm text-muted">{org?.name}</span>
                    </span>
                    <span className="text-sm font-medium text-accent">View</span>
                  </Href>
                </li>
              );
            })
          : null}
        {mode === "People"
          ? orgs.slice(0, 3).map((org) => (
              <li key={org.id} className="flex items-center gap-3">
                <Link to="/orgs/$id" params={{ id: org.id }} className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-accent text-sm font-bold text-on-accent">{org.name.slice(0, 1)}</span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{org.name}</span>
                    <span className="block truncate text-sm text-muted">
                      {org.kind} · {org.capabilities.slice(0, 2).join(" · ")}
                    </span>
                  </span>
                </Link>
                <Link to="/orgs/$id" params={{ id: org.id }} className="inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-medium text-on-accent">
                  Connect
                </Link>
              </li>
            ))
          : null}
      </ul>
    </div>
  );
}
