import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { contextLine, firstName, nextMove, oppsFor, peopleRelevant, myProjectTasks, oppReasons } from "@/lib/am/logic";
import { portrait } from "@/lib/am/photos";
import { useAM } from "@/lib/am/store";
import { ME } from "@/lib/am/types";
import { useNoticesBell } from "./shell";
import { Avatar, Button, Href, Mark } from "./ui";

export function HomePage() {
  const data = useAM();
  const me = data.people.find((person) => person.id === ME);
  const [greet, setGreet] = useState("Good morning");
  const bell = useNoticesBell();

  useEffect(() => {
    const hour = new Date().getHours();
    setGreet(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
  }, []);

  if (!me) return null;

  const move = nextMove(data, data.skipped);
  const people = peopleRelevant(data);
  const opps = oppsFor(data, ME).slice(0, 2);
  const active = data.projects.filter((project) => project.memberIds.includes(ME) && project.status !== "done").slice(0, 3);
  const blocked = myProjectTasks(data).filter((task) => task.status === "blocked" || task.status === "waiting");
  const activity = data.notices.slice(0, 3);

  return (
    <div>
      <header className="flex items-center justify-between">
        <Mark />
        <div className="flex items-center gap-1">
          {bell}
          <Link to="/me" aria-label="Your profile">
            <Avatar name={me.name} src={portrait(me.id)} />
          </Link>
        </div>
      </header>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        {greet}, {firstName(me.name)}
      </h1>
      <p className="mt-1 text-sm text-muted">{contextLine(data, data.skipped)}</p>

      <section className="mt-6">
        <h2 className="text-xs font-semibold tracking-widest text-muted">NEXT ACTION</h2>
        {move.kind === "connect" ? (
          <article className="mt-3 rounded-3xl bg-lilac p-4">
            <p className="text-xs font-semibold tracking-widest text-lilac-ink">ASK SOMEONE IN</p>
            <p className="mt-1 font-semibold">
              {move.match.person.name} for {move.project.name}
            </p>
            <p className="mt-1 text-sm text-ink/70">{move.match.reasons[0]}</p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="navy"
                onClick={() => data.connect(move.match.person.id, move.project.id, move.match.reasons[0] ?? "Closest open skill")}
              >
                Approve
              </Button>
              <Button variant="quiet" onClick={() => data.later(move.project.id, move.match.person.id)}>
                Not now
              </Button>
            </div>
          </article>
        ) : null}
        {move.kind === "task" ? (
          <article className="mt-3 rounded-3xl bg-lilac p-4">
            <p className="text-xs font-semibold tracking-widest text-lilac-ink">DO THIS</p>
            <p className="mt-1 font-semibold">{move.title}</p>
            <p className="mt-1 text-sm text-ink/70">On {move.project.name}. Nothing else is blocking a team.</p>
            <div className="mt-4 flex gap-2">
              <Button variant="navy" onClick={() => data.setTaskStatus(move.taskId, "done")}>
                Mark done
              </Button>
              <Link to="/action" className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-lilac-ink">
                All actions
              </Link>
            </div>
          </article>
        ) : null}
        {move.kind === "ask" ? (
          <article className="mt-3 rounded-3xl bg-lilac p-4">
            <p className="text-xs font-semibold tracking-widest text-lilac-ink">NAME A NEED</p>
            <p className="mt-1 text-sm text-ink/80">Nothing is waiting. Turn a question into a project and A=M will name who can help.</p>
            <Button className="mt-4" variant="navy" onClick={() => data.openFlow("")}>
              Start from a question
            </Button>
          </article>
        ) : null}
      </section>

      {opps.length ? (
        <section className="mt-8">
          <h2 className="text-xs font-semibold tracking-widest text-muted">OPPORTUNITIES</h2>
          <ul className="mt-3 space-y-3">
            {opps.map((opp) => {
              const org = data.orgs.find((item) => item.id === opp.orgId);
              const why = oppReasons(data, opp.id)[0];
              return (
                <li key={opp.id}>
                  <Href href={`/opportunities?opp=${opp.id}`} className="flex items-start gap-3 rounded-3xl bg-peach p-4">
                    <span className="min-w-0 flex-1">
                      <span className="text-xs font-semibold tracking-widest text-peach-ink">{org?.name ?? opp.kind}</span>
                      <span className="mt-0.5 block font-semibold">{opp.title}</span>
                      <span className="mt-1 block text-sm text-ink/70">{why ?? opp.summary}</span>
                    </span>
                    <ChevronRight className="mt-1 size-4 text-peach-ink" aria-hidden />
                  </Href>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {people.length ? (
        <section className="mt-8">
          <h2 className="text-xs font-semibold tracking-widest text-muted">WHO CAN HELP</h2>
          <ul className="mt-3 space-y-2">
            {people.map((match) => (
              <li key={match.person.id}>
                <Link to="/people/$id" params={{ id: match.person.id }} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
                  <Avatar name={match.person.name} src={portrait(match.person.id)} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{match.person.name}</span>
                    <span className="block text-sm text-muted">
                      {match.reasons[0]} · {match.project.name}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {active.length ? (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-widest text-muted">ACTIVE PROJECTS</h2>
            <Link to="/projects" className="text-sm text-muted">
              See all
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {active.map((project) => (
              <li key={project.id}>
                <Link to="/projects/$id" params={{ id: project.id }} className="block rounded-2xl bg-mint px-4 py-3">
                  <span className="block font-semibold">{project.name}</span>
                  <span className="mt-0.5 block text-sm text-ink/70">{project.location}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {blocked.length ? (
        <section className="mt-8">
          <h2 className="text-xs font-semibold tracking-widest text-muted">BLOCKED</h2>
          <ul className="mt-3 space-y-2">
            {blocked.map((task) => {
              const project = data.projects.find((item) => item.id === task.projectId);
              return (
                <li key={task.id} className="rounded-2xl border border-line px-4 py-3 text-sm">
                  <span className="block font-medium">{task.title}</span>
                  <span className="text-muted">{project?.name} · {task.status}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {activity.length ? (
        <section className="mt-8">
          <h2 className="text-xs font-semibold tracking-widest text-muted">RECENT</h2>
          <ul className="mt-3 space-y-2">
            {activity.map((notice) => (
              <li key={notice.id}>
                <Href href={notice.href} className="block rounded-2xl bg-sand px-4 py-3 text-sm">
                  {notice.text}
                  <span className="mt-1 block text-xs text-muted">{notice.when}</span>
                </Href>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
