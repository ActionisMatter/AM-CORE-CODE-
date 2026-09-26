import { useNavigate } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { previewProject, rankMatches, structureNeed } from "@/lib/am/logic";
import { skillName } from "@/lib/am/seed";
import { portrait } from "@/lib/am/photos";
import { useAM } from "@/lib/am/store";
import type { Draft } from "@/lib/am/types";
import { cn } from "@/lib/cn";
import { Avatar, Button, fieldClass } from "./ui";

const STEPS = ["Question", "Analysis", "Match", "Plan", "Project", "Execution", "Result"] as const;

const EXAMPLE = {
  title: "AI workflow for sales",
  description: "We want to automate our sales process using AI to be faster and more efficient.",
  result: "30% less manual work and faster follow-up.",
  deadline: "Q2 2025",
  budget: "€ 25.000 – 50.000",
};

export function Flow() {
  const open = useAM((state) => state.ui.flow);
  const nonce = useAM((state) => state.ui.nonce);
  const close = useAM((state) => state.closeFlow);
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-void/70" />
        <div className="pointer-events-none fixed inset-0 z-50 flex justify-center">
          <Dialog.Content className="pointer-events-auto flex h-full w-full max-w-phone flex-col overflow-y-auto bg-canvas outline-none">
            <Dialog.Description className="sr-only">Turn a question into a project, then choose who to invite.</Dialog.Description>
            {open ? <FlowInner key={nonce} /> : null}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function FlowInner() {
  const seed = useAM((state) => state.ui.flowSeed);
  const close = useAM((state) => state.closeFlow);
  const createFromDraft = useAM((state) => state.createFromDraft);
  const navigate = useNavigate();
  const seeded = seed.trim().length >= 8;
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(seeded ? seed.trim().slice(0, 48) : EXAMPLE.title);
  const [description, setDescription] = useState(seeded ? seed.trim() : EXAMPLE.description);
  const [result, setResult] = useState(seeded ? "" : EXAMPLE.result);
  const [deadline, setDeadline] = useState(seeded ? "" : EXAMPLE.deadline);
  const [budget, setBudget] = useState(seeded ? "" : EXAMPLE.budget);
  const [fileName, setFileName] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  const matches = draft ? rankMatches(useAM.getState(), previewProject(draft), 4) : [];

  function analyze() {
    const blob = [title, description, result, deadline && `Deadline ${deadline}`, budget && `Budget ${budget}`].filter(Boolean).join(". ");
    const next = structureNeed(blob);
    if (title.trim()) next.title = title.trim();
    setDraft(next);
    const found = rankMatches(useAM.getState(), previewProject(next), 3);
    setPicked(found.filter((match) => match.person.availability !== "later").slice(0, 2).map((match) => match.person.id));
    setStep(1);
  }

  function create() {
    if (!draft) return;
    const id = createFromDraft(draft, picked);
    close();
    void navigate({ to: "/projects/$id", params: { id } });
  }

  return (
    <div className="flex min-h-full flex-col px-5 pb-8 pt-4">
      <div className="flex items-center">
        <button type="button" aria-label="Close" onClick={() => (step === 0 ? close() : setStep((value) => value - 1))} className="grid size-11 place-items-center">
          <ChevronLeft className="size-5" />
        </button>
      </div>
      <ol className="mt-1 flex gap-2 overflow-x-auto pb-2">
        {STEPS.map((label, index) => (
          <li key={label} className="flex shrink-0 flex-col items-center gap-1">
            <span className={cn("grid size-6 place-items-center rounded-full text-xs", index === step ? "bg-accent text-on-accent" : index < step ? "bg-ink text-on-accent" : "bg-sand text-muted")}>
              {index + 1}
            </span>
            <span className={cn("text-xs", index === step ? "font-semibold" : "text-muted")}>{label}</span>
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <form
          className="mt-4 flex flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            analyze();
          }}
        >
          <Dialog.Title className="text-xl font-semibold">1. Question / Problem</Dialog.Title>
          <p className="mt-1 text-sm text-muted">What is the challenge and what do you want to achieve?</p>
          <label className="mt-5 block text-sm font-medium">
            Title
            <input className={cn(fieldClass, "mt-2")} value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Description
            <textarea className={cn(fieldClass, "mt-2 min-h-24")} value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Desired result
            <input className={cn(fieldClass, "mt-2")} value={result} onChange={(event) => setResult(event.target.value)} />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Deadline
            <input className={cn(fieldClass, "mt-2")} value={deadline} onChange={(event) => setDeadline(event.target.value)} />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Budget (optional)
            <input className={cn(fieldClass, "mt-2")} value={budget} onChange={(event) => setBudget(event.target.value)} />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Attachments
            <span className="mt-2 flex min-h-12 items-center justify-center rounded-2xl border border-dashed border-line text-sm text-muted">
              {fileName || "Upload files"}
              <input
                type="file"
                className="sr-only"
                onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
              />
            </span>
          </label>
          <div className="mt-auto flex justify-end pt-6">
            <Button type="submit" variant="navy" disabled={title.trim().length < 3 || description.trim().length < 8}>
              Next →
            </Button>
          </div>
        </form>
      ) : null}

      {step === 1 && draft ? (
        <div className="mt-4">
          <Dialog.Title className="text-xl font-semibold">2. Analysis</Dialog.Title>
          <p className="mt-1 text-sm text-muted">A=M read the question and named what the work needs.</p>
          <ul className="mt-5 space-y-2">
            {draft.requirements.map((item) => (
              <li key={item} className="rounded-2xl bg-sand px-4 py-3 text-sm">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm font-medium">Skills required</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {draft.skillIds.map((id) => (
              <li key={id} className="rounded-full bg-lilac px-3 py-1 text-sm text-lilac-ink">
                {skillName(id)}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex justify-end">
            <Button variant="navy" onClick={() => setStep(2)}>
              Next →
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 && draft ? (
        <div className="mt-4">
          <Dialog.Title className="text-xl font-semibold">3. Match</Dialog.Title>
          <p className="mt-1 text-sm text-muted">Each reason is visible. Uncheck anyone you do not want to invite.</p>
          <ul className="mt-5 space-y-3">
            {matches.length === 0 ? <li className="text-sm text-muted">No one covers these skills yet. You can still create the project.</li> : null}
            {matches.map((match) => {
              const on = picked.includes(match.person.id);
              return (
                <li key={match.person.id} className="rounded-2xl border border-line bg-card p-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={on}
                      onChange={() =>
                        setPicked((current) => (current.includes(match.person.id) ? current.filter((id) => id !== match.person.id) : [...current, match.person.id]))
                      }
                    />
                    <Avatar name={match.person.name} src={portrait(match.person.id)} size="sm" />
                    <span>
                      <span className="block font-medium">{match.person.name}</span>
                      <span className="block text-sm text-muted">{match.person.role}</span>
                    </span>
                  </label>
                  <p className="mt-3 text-sm text-muted">{match.reasons[0]}</p>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 flex justify-end">
            <Button variant="navy" onClick={() => setStep(3)}>
              Next →
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 && draft ? (
        <div className="mt-4">
          <Dialog.Title className="text-xl font-semibold">4. Plan</Dialog.Title>
          <p className="mt-1 text-sm text-muted">{draft.title} · {draft.location}</p>
          <ol className="mt-5 space-y-3">
            {["Frame the question", "Confirm the skills", "Invite the first matches", "Hold a working session"].map((item, index) => (
              <li key={item} className="flex gap-3 rounded-2xl border border-line bg-card px-4 py-3 text-sm">
                <span className="font-semibold text-accent">{index + 1}</span>
                {item}
              </li>
            ))}
          </ol>
          <div className="mt-8 flex justify-end">
            <Button variant="navy" onClick={create}>
              {picked.length ? `Create and invite ${picked.length}` : "Create project"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
