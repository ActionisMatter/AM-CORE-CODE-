import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { skillName } from "@/lib/am/seed";
import { useAM } from "@/lib/am/store";
import type { AiTurn } from "@/lib/am/types";
import { Button, PageHeader, PersonLink, fieldClass } from "./ui";

const PROMPTS = [
  "Who can help me build this?",
  "Find three developers.",
  "What should I do next?",
  "Show me projects that need my skills.",
  "Prepare this meeting.",
  "We want to transform this area of Amersfoort.",
];

export function AiPage() {
  const ai = useAM((state) => state.ai);
  const resolved = useAM((state) => state.resolved);
  const ask = useAM((state) => state.ask);
  const resolve = useAM((state) => state.resolve);
  const openFlow = useAM((state) => state.openFlow);
  const connect = useAM((state) => state.connect);
  const setTaskStatus = useAM((state) => state.setTaskStatus);
  const makePlan = useAM((state) => state.makePlan);
  const projects = useAM((state) => state.projects);
  const opps = useAM((state) => state.opportunities);
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [ai.length]);

  function send(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setText("");
    ask(clean);
  }

  function confirm(turn: AiTurn) {
    const proposal = turn.proposal;
    if (!proposal || resolved.includes(turn.id)) return;
    if (proposal.type === "review-need") {
      resolve(turn.id);
      openFlow(proposal.question);
      return;
    }
    if (proposal.type === "connect") {
      connect(proposal.personId, proposal.projectId, proposal.why);
      resolve(turn.id);
      return;
    }
    if (proposal.type === "done-task") {
      setTaskStatus(proposal.taskId, "done");
      resolve(turn.id);
      return;
    }
    makePlan(proposal.projectId);
    resolve(turn.id);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <PageHeader
        kicker="AI"
        title="Ask in plain language."
        lede="A=M reads the network you already have. It proposes. You confirm."
      />
      {ai.length === 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="min-h-11 rounded-xl border border-line bg-card px-4 py-3 text-left text-sm"
              onClick={() => send(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : (
        <ol className="space-y-4">
          {ai.map((turn) => (
            <li key={turn.id} className={turn.role === "user" ? "ml-8" : ""}>
              <article className={turn.role === "user" ? "rounded-xl bg-navy px-4 py-3 text-cream" : "rounded-xl border border-line bg-card px-4 py-4"}>
                <p className={turn.role === "user" ? "text-xs text-cream/70" : "text-xs font-semibold uppercase tracking-widest text-brass-ink"}>
                  {turn.role === "user" ? "You" : "A=M"}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{turn.body}</p>
                {turn.spots?.length ? (
                  <ul className="mt-3 space-y-2">
                    {turn.spots.map((spot) => (
                      <li key={spot.personId}>
                        <PersonLink id={spot.personId} reason={spot.reason} />
                      </li>
                    ))}
                  </ul>
                ) : null}
                {turn.projects?.length ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {turn.projects.map((id) => {
                      const project = projects.find((item) => item.id === id);
                      if (!project) return null;
                      return (
                        <li key={id}>
                          <Link to="/projects/$id" params={{ id }} className="inline-flex min-h-11 items-center rounded-full bg-sand px-3 text-sm">
                            {project.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
                {turn.opps?.length ? (
                  <ul className="mt-3 space-y-1 text-sm">
                    {turn.opps.map((id) => {
                      const opp = opps.find((item) => item.id === id);
                      if (!opp) return null;
                      return (
                        <li key={id}>
                          <Link to="/opportunities" className="text-brass-ink">
                            {opp.title}
                          </Link>
                          <span className="text-muted"> · {opp.skillIds.map((skill) => skillName(skill)).join(", ")}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
                {turn.proposal ? (
                  <div className="mt-4">
                    <Button disabled={resolved.includes(turn.id)} onClick={() => confirm(turn)}>
                      {resolved.includes(turn.id) ? "Confirmed" : labelFor(turn)}
                    </Button>
                  </div>
                ) : null}
              </article>
            </li>
          ))}
        </ol>
      )}
      <div ref={end} />
      <form
        className="sticky bottom-0 mt-6 flex flex-col gap-2 border-t border-line bg-paper py-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          send(text);
        }}
      >
        <label className="sr-only" htmlFor="ai-ask">
          Message A=M
        </label>
        <input
          id="ai-ask"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className={fieldClass}
          placeholder="Find a designer for City Lab"
        />
        <Button type="submit">Send</Button>
      </form>
      <button type="button" className="text-left text-sm text-muted" onClick={() => void navigate({ to: "/" })}>
        Back to Luke's home
      </button>
    </div>
  );
}

function labelFor(turn: AiTurn) {
  const proposal = turn.proposal;
  if (!proposal) return "Confirm";
  if (proposal.type === "review-need") return "Review and create";
  if (proposal.type === "connect") return "Connect";
  if (proposal.type === "done-task") return "Mark done";
  return "Add the plan to Action";
}
