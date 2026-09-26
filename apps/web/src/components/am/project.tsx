import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, MapPin, MoreHorizontal, Share2, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { rankMatches, uncovered } from "@/lib/am/logic";
import { coverFor, portrait } from "@/lib/am/photos";
import { skillName } from "@/lib/am/seed";
import { useAM } from "@/lib/am/store";
import { cn } from "@/lib/cn";
import { Avatar, Button, ConnectButton, Thread } from "./ui";

type View = "overview" | "execution" | "result" | "impact";
type Tab = "Updates" | "People" | "Opportunities" | "About";

function useView(): View {
  const href = useRouterState({ select: (state) => state.location.href });
  const value = new URL(href, "http://am.local").searchParams.get("view");
  if (value === "execution" || value === "result" || value === "impact") return value;
  return "overview";
}

const PHASES = [
  { title: "Discovery & Requirements", done: 3, total: 4, tone: "bg-accent" },
  { title: "Design Solution", done: 1, total: 3, tone: "bg-peach-ink" },
  { title: "Development", done: 2, total: 6, tone: "bg-mint-ink" },
  { title: "Testing & Validation", done: 0, total: 4, tone: "bg-lilac-ink" },
  { title: "Launch", done: 0, total: 3, tone: "bg-gold" },
];

export function ProjectPage({ id }: { id: string }) {
  const data = useAM();
  const router = useRouter();
  const view = useView();
  const project = data.projects.find((item) => item.id === id);
  const [menu, setMenu] = useState(false);
  const [tab, setTab] = useState<Tab>("Updates");
  const [phases, setPhases] = useState(PHASES);
  const [caseStudy, setCaseStudy] = useState(false);

  if (!project) return <p className="py-10 text-muted">This project is not in the network.</p>;

  function go(next?: View) {
    void router.history.push(next && next !== "overview" ? `/projects/${project!.id}?view=${next}` : `/projects/${project!.id}`);
    setMenu(false);
  }

  const org = data.orgs.find((item) => item.id === project.orgId);
  const cover = coverFor(project.id);
  const needs = project.needs ?? [];
  const tags = project.tags ?? project.skillIds.map((skill) => skillName(skill));
  const stats = project.stats ?? {
    people: project.memberIds.length,
    organizations: 1,
    opportunities: data.opportunities.filter((opp) => opp.projectId === project.id).length,
  };
  const matches = rankMatches(data, project, 4);

  if (view === "execution") {
    return (
      <Screen title="Project Execution" onBack={() => go()} menu={menu} setMenu={setMenu} go={go}>
        <div className="flex gap-4 overflow-x-auto border-b border-line text-sm">
          {["Overview", "Tasks", "Team", "Files", "Updates"].map((item) => (
            <span key={item} className={cn("shrink-0 border-b-2 py-3", item === "Tasks" ? "border-ink font-semibold" : "border-transparent text-muted")}>
              {item}
            </span>
          ))}
        </div>
        <ul className="mt-4 space-y-3">
          {phases.map((phase, index) => {
            const pct = Math.round((phase.done / phase.total) * 100);
            return (
              <li key={phase.title}>
                <button
                  type="button"
                  className="w-full rounded-2xl border border-line bg-card p-4 text-left"
                  onClick={() =>
                    setPhases((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, done: Math.min(item.total, item.done + 1) } : item,
                      ),
                    )
                  }
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{phase.title}</span>
                    <span className="text-sm text-muted">{pct}%</span>
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {phase.done}/{phase.total} completed
                  </span>
                  <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-sand">
                    <span className={cn("block h-full rounded-full", phase.tone)} style={{ width: `${pct}%` }} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted">Tap a phase to move it forward.</p>
      </Screen>
    );
  }

  if (view === "result") {
    return (
      <Screen title="Project Result" onBack={() => go()} menu={menu} setMenu={setMenu} go={go}>
        <div className="rounded-3xl bg-mint p-4">
          <p className="font-semibold text-mint-ink">Project Completed</p>
          <p className="mt-1 text-sm text-ink/70">The deliverables have been delivered and approved.</p>
        </div>
        <h2 className="mt-6 text-lg font-semibold">Impact</h2>
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {[
            ["30%", "Less manual work"],
            ["2x", "Faster follow-up"],
            ["+25%", "Sales conversion"],
          ].map(([value, label]) => (
            <li key={label} className="rounded-2xl bg-sand px-2 py-4 text-center">
              <span className="block text-lg font-semibold text-mint-ink">{value}</span>
              <span className="mt-1 block text-xs text-muted">{label}</span>
            </li>
          ))}
        </ul>
        <blockquote className="mt-6 rounded-2xl bg-sand p-4 text-sm">
          “The AI workflow has significantly improved our sales process. Great collaboration.”
          <footer className="mt-2 text-muted">— TechForward</footer>
        </blockquote>
        <Button
          variant="navy"
          className="mt-6 w-full"
          onClick={() => {
            setCaseStudy(true);
            data.pushToast("Case study saved on this project.");
          }}
        >
          {caseStudy ? "Case study saved" : "Create Case Study"}
        </Button>
        <button
          type="button"
          className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 text-sm font-medium"
          onClick={() => data.pushToast("Result ready to share.")}
        >
          <Share2 className="size-4" aria-hidden /> Share Result
        </button>
      </Screen>
    );
  }

  if (view === "impact") {
    const nodes = [
      { label: "People", value: "+5", tone: "bg-accent", className: "left-0 top-8" },
      { label: "Organizations", value: "+3", tone: "bg-lilac-ink", className: "right-0 top-8" },
      { label: "Opportunities", value: "+2", tone: "bg-peach-ink", className: "bottom-2 left-2" },
      { label: "New projects", value: "+1", tone: "bg-mint-ink", className: "bottom-2 right-2" },
    ];
    return (
      <Screen title="Network Impact" onBack={() => go()} menu={menu} setMenu={setMenu} go={go}>
        <p className="rounded-2xl bg-sand px-4 py-3 text-sm">This project has created new connections and opportunities.</p>
        <div className="relative mx-auto mt-8 h-64 w-full max-w-xs">
          <span className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-sm font-bold text-on-accent">
            A=M
          </span>
          {nodes.map((node) => (
            <span key={node.label} className={cn("absolute w-24 text-center", node.className)}>
              <span className={cn("mx-auto grid size-12 place-items-center rounded-full text-xs font-semibold text-on-accent", node.tone)}>
                {node.value}
              </span>
              <span className="mt-1 block text-xs text-muted">{node.label}</span>
            </span>
          ))}
        </div>
        <h2 className="mt-6 text-lg font-semibold">Next opportunities</h2>
        <ul className="mt-3 space-y-2">
          {data.opportunities.slice(0, 3).map((opp) => (
            <li key={opp.id}>
              <Link to="/opportunities" className="block rounded-2xl border border-line bg-card px-4 py-3">
                <span className="block font-medium">{opp.title}</span>
                <span className="block text-sm text-muted">Based on this project</span>
              </Link>
            </li>
          ))}
        </ul>
      </Screen>
    );
  }

  return (
    <div className="-mx-5">
      <div className="relative">
        {cover ? <img src={cover} alt="" className="h-52 w-full object-cover" /> : <div className="h-36 bg-sand" />}
        <button type="button" aria-label="Back" onClick={() => router.history.back()} className="absolute left-3 top-3 grid size-11 place-items-center rounded-full bg-card/85">
          <ChevronLeft className="size-5" />
        </button>
        <span className="absolute bottom-3 left-4 rounded-full bg-mint px-3 py-1 text-xs font-semibold text-mint-ink">
          {project.status === "active" ? "Active" : project.status === "done" ? "Complete" : "Forming"}
        </span>
      </div>
      <div className="px-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <button type="button" aria-label="More project views" onClick={() => setMenu((value) => !value)} className="grid size-11 place-items-center">
            <MoreHorizontal className="size-5" />
          </button>
        </div>
        {menu ? <ViewMenu go={go} /> : null}
        <p className="mt-1 flex items-center gap-1 text-sm text-muted">
          <MapPin className="size-3.5" aria-hidden />
          {project.location}
        </p>
        <p className="mt-3 text-sm leading-relaxed">{project.summary}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag} className="rounded-full bg-sand px-3 py-1 text-xs">
              {tag}
            </li>
          ))}
        </ul>
        <ul className="mt-5 grid grid-cols-3 gap-2 text-center">
          {[
            [stats.people, "People"],
            [stats.organizations, "Organizations"],
            [stats.opportunities, "Opportunities"],
          ].map(([value, label]) => (
            <li key={String(label)} className="rounded-2xl bg-sand py-3">
              <span className="block text-xl font-semibold">{value}</span>
              <span className="text-xs text-muted">{label}</span>
            </li>
          ))}
        </ul>
        {needs.length ? (
          <section className="mt-6">
            <h2 className="text-lg font-semibold">What we need</h2>
            <ul className="mt-3 space-y-3">
              {needs.map((need) => (
                <li key={need.title} className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-sand">
                    <Users className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{need.title}</span>
                    <span className="block text-xs text-muted">{need.detail}</span>
                  </span>
                  <ConnectButton personId={need.personId} why={`${need.title} for ${project.name}`} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <div className="mt-6 flex gap-4 overflow-x-auto border-b border-line text-sm">
          {(["Updates", "People", "Opportunities", "About"] as Tab[]).map((item) => (
            <button key={item} type="button" onClick={() => setTab(item)} className={cn("shrink-0 border-b-2 py-3", tab === item ? "border-ink font-semibold" : "border-transparent text-muted")}>
              {item}
            </button>
          ))}
        </div>
        <div className="mt-4">
          {tab === "Updates" ? <Thread threadId={`project:${project.id}`} /> : null}
          {tab === "People" ? (
            <ul className="space-y-3">
              {project.memberIds.map((memberId) => {
                const person = data.people.find((item) => item.id === memberId);
                if (!person) return null;
                return (
                  <li key={person.id}>
                    <Link to="/people/$id" params={{ id: person.id }} className="flex items-center gap-3">
                      <Avatar name={person.name} src={portrait(person.id)} />
                      <span>
                        <span className="block font-medium">{person.name}</span>
                        <span className="block text-sm text-muted">{person.role}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
              {matches.map((match) => (
                <li key={match.person.id} className="rounded-2xl border border-line p-3">
                  <p className="text-sm font-medium">{match.person.name}</p>
                  <p className="mt-1 text-sm text-muted">{match.reasons[0]}</p>
                  <div className="mt-2">
                    <ConnectButton personId={match.person.id} projectId={project.id} why={match.reasons[0] ?? "Project match"} />
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          {tab === "Opportunities" ? (
            <ul className="space-y-2">
              {data.opportunities
                .filter((opp) => opp.projectId === project.id || opp.orgId === project.orgId)
                .map((opp) => (
                  <li key={opp.id}>
                    <Link to="/opportunities" className="block rounded-2xl border border-line px-4 py-3">
                      <span className="font-medium">{opp.title}</span>
                      <span className="mt-1 block text-sm text-muted">{opp.summary}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          ) : null}
          {tab === "About" ? (
            <div className="space-y-3 text-sm leading-relaxed">
              <p>{project.objective}</p>
              {org ? <p className="text-muted">With {org.name}.</p> : null}
              <p className="text-muted">Open skills: {uncovered(data, project).map((skill) => skillName(skill)).join(", ") || "covered"}.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ViewMenu({ go }: { go: (view?: View) => void }) {
  return (
    <div className="mb-3 grid grid-cols-2 gap-2">
      {(
        [
          ["overview", "Overview"],
          ["execution", "Execution"],
          ["result", "Result"],
          ["impact", "Network impact"],
        ] as const
      ).map(([id, label]) => (
        <button key={id} type="button" className="min-h-11 rounded-2xl bg-sand text-sm font-medium" onClick={() => go(id === "overview" ? undefined : id)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Screen({
  title,
  onBack,
  menu,
  setMenu,
  go,
  children,
}: {
  title: string;
  onBack: () => void;
  menu: boolean;
  setMenu: (value: boolean) => void;
  go: (view?: View) => void;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Back" onClick={onBack} className="grid size-11 place-items-center">
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-base font-semibold">{title}</h1>
        <button type="button" aria-label="More" onClick={() => setMenu(!menu)} className="grid size-11 place-items-center">
          <MoreHorizontal className="size-5" />
        </button>
      </div>
      {menu ? <ViewMenu go={go} /> : null}
      {children}
    </div>
  );
}

export function ProjectsPage() {
  const projects = useAM((state) => state.projects);
  const openFlow = useAM((state) => state.openFlow);
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Button onClick={() => openFlow("")}>New</Button>
      </div>
      <ul className="mt-4 space-y-3">
        {projects.map((project) => (
          <li key={project.id}>
            <Link to="/projects/$id" params={{ id: project.id }} className="block overflow-hidden rounded-3xl border border-line bg-card">
              {coverFor(project.id) ? <img src={coverFor(project.id)} alt="" className="h-32 w-full object-cover" /> : null}
              <span className="block p-4">
                <span className="text-xs font-semibold tracking-widest text-muted">{project.status === "active" ? "Active" : project.status}</span>
                <span className="mt-1 block text-lg font-semibold">{project.name}</span>
                <span className="mt-1 block text-sm text-muted">{project.location}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
