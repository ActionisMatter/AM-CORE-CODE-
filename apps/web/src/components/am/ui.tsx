import { Link, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { availabilityLabel, firstName } from "@/lib/am/logic";
import { portrait } from "@/lib/am/photos";
import { skillName } from "@/lib/am/seed";
import { useAM } from "@/lib/am/store";
import type { Availability, SkillId } from "@/lib/am/types";

export function Mark({ tone = "ink", className }: { tone?: "ink" | "gold"; className?: string }) {
  if (tone === "gold") {
    return <span className={cn("font-display text-5xl font-semibold tracking-wide text-gold", className)}>A=M</span>;
  }
  return <span className={cn("text-2xl font-bold tracking-tight text-ink", className)}>A=M</span>;
}

export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

const avatarSize = {
  sm: "size-8 text-xs",
  md: "size-11 text-sm",
  lg: "size-16 text-base",
  xl: "size-20 text-lg",
} as const;

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string;
  size?: keyof typeof avatarSize;
  className?: string;
}) {
  if (src) {
    return <img src={src} alt="" className={cn("shrink-0 rounded-full object-cover", avatarSize[size], className)} />;
  }
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-void-card font-semibold text-gold",
        avatarSize[size],
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

const buttonVariants = {
  brass: "bg-accent text-on-accent hover:bg-accent-deep",
  navy: "bg-gold text-void hover:bg-gold-deep",
  quiet: "border border-line bg-card text-ink hover:bg-sand",
  ghost: "text-ink hover:bg-sand",
  gold: "bg-gradient-to-b from-gold to-gold-deep text-void",
} as const;

export function buttonClass(variant: keyof typeof buttonVariants = "brass", className?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium motion-safe:transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    buttonVariants[variant],
    className,
  );
}

export function Button({
  variant = "brass",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonVariants }) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}

export const fieldClass =
  "w-full rounded-2xl border border-line bg-card px-4 py-3 text-base text-ink outline-none placeholder:text-muted focus-visible:border-accent";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-widest text-muted">{children}</p>;
}

export function PageHeader({ kicker, title, lede }: { kicker?: string; title: string; lede?: string }) {
  return (
    <header className="mb-6 max-w-2xl">
      {kicker ? <Eyebrow>{kicker}</Eyebrow> : null}
      <h1 className={cn("text-3xl font-semibold tracking-tight text-ink", kicker && "mt-2")}>{title}</h1>
      {lede ? <p className="mt-3 text-base text-muted">{lede}</p> : null}
    </header>
  );
}

export function Panel({
  children,
  className,
  dark = false,
}: {
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <section className={cn("rounded-2xl border p-5 shadow-card", dark ? "border-navy bg-navy text-cream" : "border-line bg-card text-ink", className)}>
      {children}
    </section>
  );
}

export function SkillChips({ ids, open = [] }: { ids: SkillId[]; open?: SkillId[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {ids.map((id) => {
        const missing = open.includes(id);
        return (
          <li key={id} className={cn("rounded-full px-3 py-1 text-sm", missing ? "bg-lilac text-lilac-ink" : "bg-sand text-ink")}>
            {skillName(id)}
            {missing ? " · open" : ""}
          </li>
        );
      })}
    </ul>
  );
}

export function FactGrid({ facts }: { facts: { k: string; v: string }[] }) {
  return (
    <dl className="grid gap-3">
      {facts.map((fact) => (
        <div key={fact.k} className="rounded-2xl border border-line bg-card px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-widest text-muted">{fact.k}</dt>
          <dd className="mt-1 text-sm">{fact.v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function StatusText({ value }: { value: Availability }) {
  return <span className="text-sm text-muted">{availabilityLabel(value)}</span>;
}

export function Thread({ threadId }: { threadId: string }) {
  const allMessages = useAM((state) => state.messages);
  const people = useAM((state) => state.people);
  const sendMessage = useAM((state) => state.sendMessage);
  const messages = allMessages.filter((message) => message.threadId === threadId);

  return (
    <div>
      {messages.length === 0 ? <p className="text-sm text-muted">No notes yet. A connection starts the thread.</p> : null}
      <ol className="space-y-3">
        {messages.map((message) => {
          const author = people.find((person) => person.id === message.authorId);
          const mine = message.authorId === "luke";
          return (
            <li key={message.id} className={cn("rounded-2xl px-4 py-3", mine ? "bg-ink text-on-accent" : "bg-sand text-ink")}>
              <p className={cn("text-xs", mine ? "text-on-accent/70" : "text-muted")}>
                {author?.name ?? "Someone"} · {message.atLabel}
              </p>
              <p className="mt-1 text-sm">{message.body}</p>
            </li>
          );
        })}
      </ol>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          const body = String(data.get("body") ?? "");
          sendMessage(threadId, body);
          form.reset();
        }}
      >
        <label className="sr-only" htmlFor={`msg-${threadId}`}>
          Message
        </label>
        <input id={`msg-${threadId}`} name="body" className={fieldClass} placeholder="Write a note" autoComplete="off" />
        <Button type="submit" variant="navy">
          Send
        </Button>
      </form>
    </div>
  );
}

export function PersonLink({ id, reason }: { id: string; reason?: string }) {
  const person = useAM((state) => state.people.find((item) => item.id === id));
  if (!person) return null;
  return (
    <Link to="/people/$id" params={{ id: person.id }} className="flex min-h-11 items-center gap-3 rounded-2xl border border-line bg-card px-3 py-2">
      <Avatar name={person.name} src={portrait(person.id)} />
      <span className="min-w-0">
        <span className="block font-medium">{person.name}</span>
        <span className="block truncate text-sm text-muted">{reason ?? `${person.role} · ${person.location}`}</span>
      </span>
    </Link>
  );
}

export function ConnectButton({
  personId,
  projectId,
  why,
  variant = "brass",
}: {
  personId: string;
  projectId?: string;
  why: string;
  variant?: keyof typeof buttonVariants;
}) {
  const person = useAM((state) => state.people.find((item) => item.id === personId));
  const connection = useAM((state) => state.connections.find((item) => item.personId === personId));
  const onTeam = useAM((state) =>
    projectId ? state.projects.some((project) => project.id === projectId && project.memberIds.includes(personId)) : false,
  );
  const connect = useAM((state) => state.connect);
  if (!person) return null;
  const first = firstName(person.name);
  if (projectId && onTeam) {
    return (
      <Button variant="quiet" disabled>
        On the team
      </Button>
    );
  }
  if (connection?.status === "pending") {
    return (
      <Button variant="quiet" disabled>
        Waiting on {first}
      </Button>
    );
  }
  if (connection?.status === "connected" && projectId) {
    return (
      <Button variant="navy" onClick={() => connect(personId, projectId, why)} aria-label={`Add ${first} to the team`}>
        Add {first}
      </Button>
    );
  }
  if (connection?.status === "connected") {
    return (
      <Link to="/people/$id" params={{ id: personId }} className={buttonClass("quiet")}>
        Message
      </Link>
    );
  }
  return (
    <Button variant={variant} onClick={() => connect(personId, projectId, why)} aria-label={`Connect ${first}`}>
      Connect
    </Button>
  );
}

export function LinesField({
  label,
  hint,
  value,
  onCommit,
}: {
  label: string;
  hint?: string;
  value: string[];
  onCommit: (next: string[]) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {hint ? <span className="mt-1 block text-sm text-muted">{hint}</span> : null}
      <textarea
        className={cn(fieldClass, "mt-2")}
        rows={4}
        defaultValue={value.join("\n")}
        key={value.join("|")}
        onBlur={(event) =>
          onCommit(
            event.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          )
        }
      />
    </label>
  );
}

export function Href({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        void router.history.push(href);
      }}
    >
      {children}
    </a>
  );
}
