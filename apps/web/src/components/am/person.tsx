import { Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft, MapPin, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { availabilityLabel, oppsFor } from "@/lib/am/logic";
import { coverFor, portrait } from "@/lib/am/photos";
import { SKILLS, skillName } from "@/lib/am/seed";
import { useAM } from "@/lib/am/store";
import { ME, type SkillId } from "@/lib/am/types";
import { cn } from "@/lib/cn";
import { Avatar, Button, ConnectButton, LinesField, Thread, fieldClass } from "./ui";

export function PersonPage({ id }: { id: string }) {
  const person = useAM((state) => state.people.find((item) => item.id === id));
  if (!person) return <p className="py-10 text-muted">This person is not in the network.</p>;
  if (person.id === ME) return <MePage />;
  return <Profile personId={person.id} />;
}

function Profile({ personId }: { personId: string }) {
  const data = useAM();
  const router = useRouter();
  const person = data.people.find((item) => item.id === personId);
  const [more, setMore] = useState(false);
  if (!person) return null;
  const org = data.orgs.find((item) => item.id === person.orgId);
  const projects = data.projects.filter((project) => project.memberIds.includes(person.id));
  const near = oppsFor(data, person.id).slice(0, 3);
  const connection = data.connections.find((item) => item.personId === person.id);
  const cover = coverFor(person.id);
  const available = person.availability !== "later";

  return (
    <div className="-mx-5">
      <div className="relative">
        {cover ? (
          <img src={cover} alt="" className="h-52 w-full object-cover" />
        ) : (
          <div className="h-36 bg-sand" />
        )}
        <button type="button" aria-label="Back" onClick={() => router.history.back()} className="absolute left-3 top-3 grid size-11 place-items-center rounded-full bg-card/80">
          <ChevronLeft className="size-5" />
        </button>
        {portrait(person.id) ? (
          <img src={portrait(person.id)} alt="" className="absolute -bottom-8 left-5 size-20 rounded-full object-cover ring-4 ring-canvas" />
        ) : (
          <span className="absolute -bottom-8 left-5">
            <Avatar name={person.name} size="xl" className="ring-4 ring-canvas" />
          </span>
        )}
      </div>
      <div className="px-5 pt-12">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">{person.name}</h1>
              {available ? <span className="rounded-full bg-mint px-2 py-0.5 text-xs font-medium text-mint-ink">Available</span> : <span className="rounded-full bg-sand px-2 py-0.5 text-xs text-muted">Booked</span>}
            </div>
            <p className="mt-1 text-sm text-muted">{person.role}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <MapPin className="size-3.5" aria-hidden />
              {person.location}
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <ConnectButton personId={person.id} why={connection?.why ?? `${person.role}`} variant="navy" />
          <a href="#thread" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-line bg-card text-sm font-medium">
            Message
          </a>
          <button type="button" aria-label="More" onClick={() => setMore((value) => !value)} className="grid size-11 place-items-center rounded-full border border-line bg-card">
            <MoreHorizontal className="size-4" />
          </button>
        </div>
        {more && org ? (
          <Link to="/orgs/$id" params={{ id: org.id }} className="mt-3 block rounded-2xl bg-sand px-4 py-3 text-sm font-medium">
            {org.name}
          </Link>
        ) : null}

        <section className="mt-8">
          <h2 className="text-lg font-semibold">About</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/80">{person.about}</p>
        </section>
        <section className="mt-6">
          <h2 className="text-lg font-semibold">How I can contribute</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {(person.services.length ? person.services : person.skills.map((skill) => skillName(skill))).map((item) => (
              <li key={item} className="rounded-full bg-sand px-3 py-1.5 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-6">
          <h2 className="text-lg font-semibold">I'm looking for</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {person.interests.map((item) => (
              <li key={item} className="rounded-full bg-sand px-3 py-1.5 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </section>
        {projects.length ? (
          <section className="mt-6">
            <h2 className="text-lg font-semibold">Current projects</h2>
            <ul className="mt-3 space-y-2">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link to="/projects/$id" params={{ id: project.id }} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
                    {coverFor(project.id) ? <img src={coverFor(project.id)} alt="" className="h-14 w-20 rounded-xl object-cover" /> : null}
                    <span>
                      <span className="block font-semibold">{project.name}</span>
                      <span className="block text-sm text-muted">{project.location}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {near.length ? (
          <section className="mt-6">
            <h2 className="text-lg font-semibold">Opportunities near these skills</h2>
            <ul className="mt-3 space-y-2">
              {near.map((opp) => (
                <li key={opp.id}>
                  <a href={`/opportunities?opp=${opp.id}`} className="block rounded-2xl bg-sand px-4 py-3 text-sm font-medium">
                    {opp.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <section id="thread" className="mt-8">
          <h2 className="text-lg font-semibold">Conversation</h2>
          <p className="mt-1 text-sm text-muted">{availabilityLabel(person.availability)}</p>
          <div className="mt-3">
            {connection?.status === "connected" ? (
              <Thread threadId={`dm:${person.id}`} />
            ) : (
              <p className="text-sm text-muted">Connect to open a conversation.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export function MePage() {
  const data = useAM();
  const me = data.people.find((person) => person.id === ME);
  const [edit, setEdit] = useState(false);
  if (!me) return null;
  const projects = data.projects.filter((project) => project.memberIds.includes(me.id));
  return (
    <div>
      <div className="flex items-center gap-3">
        <Avatar name={me.name} src={portrait(me.id)} size="xl" />
        <div>
          <h1 className="text-2xl font-semibold">{me.name}</h1>
          <p className="text-sm text-muted">{me.role}</p>
          <p className="text-sm text-muted">{me.location}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed">{me.about}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {me.services.map((item) => (
          <li key={item} className="rounded-full bg-sand px-3 py-1 text-sm">
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="quiet" onClick={() => setEdit((value) => !value)}>
          {edit ? "Close editor" : "Edit profile"}
        </Button>
        <Button variant="ghost" onClick={() => data.reset()}>
          Restore demo
        </Button>
      </div>
      {edit ? (
        <div className="mt-4 space-y-4">
          <label className="block text-sm font-medium">
            About
            <textarea id="about" className={cn(fieldClass, "mt-2")} rows={4} value={me.about} onChange={(event) => data.updateMe({ about: event.target.value })} />
          </label>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((skill) => {
              const on = me.skills.includes(skill.id);
              return (
                <button
                  key={skill.id}
                  type="button"
                  aria-pressed={on}
                  className={cn("min-h-11 rounded-full px-3 text-sm", on ? "bg-ink text-on-accent" : "bg-sand")}
                  onClick={() =>
                    data.updateMe({
                      skills: on ? me.skills.filter((id) => id !== skill.id) : [...me.skills, skill.id as SkillId],
                    })
                  }
                >
                  {skill.name}
                </button>
              );
            })}
          </div>
          <LinesField label="What you offer" value={me.services} onCommit={(services) => data.updateMe({ services })} />
          <LinesField label="Looking for" value={me.interests} onCommit={(interests) => data.updateMe({ interests })} />
        </div>
      ) : null}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Your projects</h2>
        <ul className="mt-3 space-y-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link to="/projects/$id" params={{ id: project.id }} className="block rounded-2xl border border-line bg-card px-4 py-3 font-medium">
                {project.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <div className="mt-6 flex gap-3 text-sm font-medium">
        <Link to="/action" className="text-accent">
          Action
        </Link>
        <Link to="/ai" className="text-accent">
          Ask A=M
        </Link>
        <button
          type="button"
          className="text-muted"
          onClick={() => {
            localStorage.removeItem("am-entered");
            window.location.assign("/");
          }}
        >
          Replay welcome
        </button>
      </div>
    </div>
  );
}

export function OrgPage({ id }: { id: string }) {
  const data = useAM();
  const router = useRouter();
  const org = data.orgs.find((item) => item.id === id);
  if (!org) return <p className="py-10 text-muted">This organization is not in the network.</p>;
  const team = org.team.map((personId) => data.people.find((person) => person.id === personId)).filter((person) => person !== undefined);
  const projects = data.projects.filter((project) => project.orgId === org.id);
  const opps = data.opportunities.filter((opp) => opp.orgId === org.id);
  const partners = org.partners
    .map((partnerId) => data.orgs.find((item) => item.id === partnerId))
    .filter((item) => item !== undefined);
  return (
    <div>
      <button type="button" aria-label="Back" onClick={() => router.history.back()} className="grid size-11 place-items-center rounded-full">
        <ChevronLeft className="size-5" />
      </button>
      <p className="text-xs font-semibold tracking-widest text-muted">
        {org.kind} · {org.location}
      </p>
      <h1 className="mt-1 text-3xl font-semibold">{org.name}</h1>
      <p className="mt-3 text-sm leading-relaxed">{org.about}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {org.capabilities.map((item) => (
          <li key={item} className="rounded-full bg-sand px-3 py-1 text-sm">
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted">{org.capacity}</p>
      {org.services.length ? (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Services</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {org.services.map((item) => (
              <li key={item} className="rounded-full bg-sand px-3 py-1 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {opps.length ? (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Opportunities</h2>
          <ul className="mt-3 space-y-2">
            {opps.map((opp) => (
              <li key={opp.id}>
                <a href={`/opportunities?opp=${opp.id}`} className="block rounded-2xl border border-line bg-card px-4 py-3">
                  <span className="block font-medium">{opp.title}</span>
                  <span className="block text-sm text-muted">{opp.summary}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <label className="mt-6 block text-sm font-medium">
        About
        <textarea className={cn(fieldClass, "mt-2 font-normal")} rows={4} value={org.about} onChange={(event) => data.updateOrg(org.id, { about: event.target.value })} />
      </label>
      <button type="button" className="mt-3 text-sm font-medium text-accent" onClick={() => data.updateOrg(org.id, { exposed: !org.exposed })}>
        {org.exposed ? "Visible to the network" : "Hidden from the network"}
      </button>
      <section className="mt-6">
        <h2 className="text-lg font-semibold">Team</h2>
        <ul className="mt-3 space-y-2">
          {team.map((person) => (
            <li key={person.id}>
              <Link to="/people/$id" params={{ id: person.id }} className="flex items-center gap-3">
                <Avatar name={person.name} src={portrait(person.id)} size="sm" />
                <span>
                  <span className="block font-medium">{person.name}</span>
                  <span className="block text-sm text-muted">{person.role}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-6">
        <h2 className="text-lg font-semibold">Projects</h2>
        <ul className="mt-3 space-y-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link to="/projects/$id" params={{ id: project.id }} className="font-medium">
                {project.name}
              </Link>
            </li>
          ))}
          {projects.length === 0 ? <li className="text-sm text-muted">No projects yet.</li> : null}
        </ul>
      </section>
      {partners.length ? (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Partners</h2>
          <ul className="mt-3 space-y-2">
            {partners.map((partner) => (
              <li key={partner.id}>
                <Link to="/orgs/$id" params={{ id: partner.id }} className="font-medium">
                  {partner.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {org.needs.length ? (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Next</h2>
          <ul className="mt-3 space-y-2">
            {org.needs.map((need) => (
              <li key={need}>
                <button type="button" className="text-left text-sm font-medium text-accent" onClick={() => data.openFlow(need)}>
                  {need}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
