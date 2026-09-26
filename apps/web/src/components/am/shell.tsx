import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { Command } from "cmdk";
import { Bell, FolderKanban, Home, Plus, Search, UserRound } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { isNeed } from "@/lib/am/logic";
import { useAM } from "@/lib/am/store";
import { ME } from "@/lib/am/types";
import { cn } from "@/lib/cn";
import { Flow } from "./flow";
import { Onboarding } from "./onboarding";
import { Avatar, Button, Mark, buttonClass } from "./ui";
import { portrait } from "@/lib/am/photos";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/network", label: "Explore", icon: Search },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/me", label: "You", icon: UserRound },
] as const;

function active(path: string, to: string) {
  if (to === "/") return path === "/";
  if (to === "/projects") return path.startsWith("/projects");
  if (to === "/me") return path === "/me";
  return path === to || path.startsWith(`${to}/`);
}

function Bars({ light = false }: { light?: boolean }) {
  const tone = light ? "bg-cream" : "bg-ink";
  return (
    <span className="flex items-end gap-0.5" aria-hidden>
      <span className={cn("h-1 w-0.5 rounded-sm", tone)} />
      <span className={cn("h-1.5 w-0.5 rounded-sm", tone)} />
      <span className={cn("h-2 w-0.5 rounded-sm", tone)} />
      <span className={cn("h-2.5 w-0.5 rounded-sm", tone)} />
    </span>
  );
}

function StatusBar() {
  const [time, setTime] = useState("9:41");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="flex items-center justify-between px-6 pb-1 pt-3 text-xs font-semibold text-ink">
      <span>{time}</span>
      <Bars />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const me = useAM((state) => state.people.find((person) => person.id === ME));
  const reset = useAM((state) => state.reset);
  const openFlow = useAM((state) => state.openFlow);
  const [mode, setMode] = useState<"intro" | "app">("intro");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      void useAM.persist.rehydrate();
    } catch {
      reset();
    }
    if (localStorage.getItem("am-entered") === "1") setMode("app");
  }, [reset]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        useAM.getState().openCommand();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (mode === "intro") {
    return (
      <div className="min-h-dvh bg-void">
        <div className="am-phone bg-void">
          <Onboarding
            onEnter={() => {
              localStorage.setItem("am-entered", "1");
              setMode("app");
            }}
          />
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <main className="am-phone px-6 py-16">
        <Mark />
        <h1 className="mt-6 text-3xl font-semibold">This workspace needs a reset.</h1>
        <Button className="mt-6" onClick={() => reset()}>
          Restore starting point
        </Button>
      </main>
    );
  }

  return (
    <div className="min-h-dvh bg-stage text-ink">
      <div className="am-phone">
        <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2">
          Skip to content
        </a>
        <StatusBar />
        <main id="content" className="px-5 pb-28">
          {children}
        </main>
        <nav className="am-nav border-t border-line bg-card/95 backdrop-blur" aria-label="Primary">
          <div className="grid grid-cols-5 items-end px-2 pb-2 pt-1">
            {TABS.slice(0, 2).map((item) => (
              <Tab key={item.to} {...item} path={path} />
            ))}
            <button
              type="button"
              aria-label="Start from a question"
              onClick={() => openFlow("")}
              className="-mt-5 grid size-14 place-items-center justify-self-center rounded-full bg-accent text-on-accent shadow-card"
            >
              <Plus className="size-6" aria-hidden />
            </button>
            {TABS.slice(2).map((item) => (
              <Tab key={item.to} {...item} path={path} />
            ))}
          </div>
        </nav>
      </div>
      <Toasts />
      {mounted ? <Flow /> : null}
      {mounted ? <CommandPalette /> : null}
      {mounted ? <Notices /> : null}
    </div>
  );
}

function Tab({ to, label, icon: Icon, path }: { to: "/" | "/network" | "/projects" | "/me"; label: string; icon: typeof Home; path: string }) {
  const on = active(path, to);
  return (
    <Link to={to} aria-current={on ? "page" : undefined} className={cn("flex min-h-12 flex-col items-center justify-center gap-0.5 text-xs", on ? "text-accent" : "text-muted")}>
      <Icon className="size-5" aria-hidden />
      {label}
    </Link>
  );
}

function Toasts() {
  const toasts = useAM((state) => state.toasts);
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4">
      <div className="flex w-full max-w-phone flex-col gap-2">
        {toasts.map((toast) => (
          <p key={toast.id} className="rounded-full bg-gold px-4 py-3 text-center text-sm text-void shadow-card" role="status">
            {toast.text}
          </p>
        ))}
      </div>
    </div>
  );
}

function Notices() {
  const open = useAM((state) => state.ui.notices);
  const close = useAM((state) => state.closeNotices);
  const notices = useAM((state) => state.notices);
  const readNotice = useAM((state) => state.readNotice);
  const readAll = useAM((state) => state.readAll);
  const router = useRouter();
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-void/70" />
        <div className="pointer-events-none fixed inset-0 z-50 flex justify-center">
          <Dialog.Content className="pointer-events-auto mt-16 flex h-[70dvh] w-full max-w-phone flex-col rounded-t-3xl bg-card p-5 shadow-card outline-none" aria-describedby={undefined}>
            <div className="flex items-center justify-between gap-3">
              <Dialog.Title className="text-xl font-semibold">Notices</Dialog.Title>
              <button type="button" className={buttonClass("ghost")} onClick={() => readAll()}>
                Mark read
              </button>
            </div>
            <ul className="mt-4 space-y-2 overflow-y-auto">
              {notices.length === 0 ? <li className="text-sm text-muted">Nothing waiting.</li> : null}
              {notices.map((notice) => (
                <li key={notice.id}>
                  <button
                    type="button"
                    className={cn("w-full rounded-2xl border px-4 py-3 text-left", notice.read ? "border-line bg-card" : "border-accent bg-sand")}
                    onClick={() => {
                      readNotice(notice.id);
                      close();
                      void router.history.push(notice.href);
                    }}
                  >
                    <span className="block text-sm">{notice.text}</span>
                    <span className="mt-1 block text-xs text-muted">{notice.when}</span>
                  </button>
                </li>
              ))}
            </ul>
            <Dialog.Close className={cn(buttonClass("quiet"), "mt-4")}>Close</Dialog.Close>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CommandPalette() {
  const open = useAM((state) => state.ui.command);
  const close = useAM((state) => state.closeCommand);
  const openFlow = useAM((state) => state.openFlow);
  const ask = useAM((state) => state.ask);
  const people = useAM((state) => state.people);
  const projects = useAM((state) => state.projects);
  const orgs = useAM((state) => state.orgs);
  const opportunities = useAM((state) => state.opportunities);
  const navigate = useNavigate();
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const needle = query.trim().toLowerCase();
  const go = (href: string) => {
    close();
    void router.history.push(href);
  };
  const submit = (text: string) => {
    const clean = text.trim();
    if (!clean) {
      openFlow("");
      return;
    }
    close();
    if (isNeed(clean)) openFlow(clean);
    else {
      ask(clean);
      void navigate({ to: "/ai" });
    }
  };

  const foundPeople = needle ? people.filter((person) => `${person.name} ${person.role}`.toLowerCase().includes(needle)).slice(0, 5) : [];
  const foundProjects = needle ? projects.filter((project) => project.name.toLowerCase().includes(needle)).slice(0, 4) : [];
  const foundOrgs = needle ? orgs.filter((org) => org.name.toLowerCase().includes(needle)).slice(0, 4) : [];
  const foundOpps = needle ? opportunities.filter((opp) => opp.title.toLowerCase().includes(needle)).slice(0, 4) : [];

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-void/70" />
        <div className="pointer-events-none fixed inset-0 z-50 flex justify-center px-4 pt-16">
          <Dialog.Content className="pointer-events-auto w-full max-w-phone overflow-hidden rounded-3xl border border-line bg-card shadow-card outline-none" aria-describedby={undefined}>
            <Dialog.Title className="sr-only">Ask or search</Dialog.Title>
            <Command shouldFilter={false} label="Ask or search">
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Find a person, or name a need"
                className="w-full border-b border-line bg-transparent px-4 py-4 text-base outline-none placeholder:text-muted"
              />
              <Command.List className="max-h-96 overflow-y-auto p-2">
                <Command.Empty className="px-3 py-6 text-sm text-muted">Nothing under that name. Ask A=M instead.</Command.Empty>
                {needle.length > 1 ? (
                  <Command.Group heading="Ask">
                    <Command.Item value={`ask-${query}`} className="px-3 py-3 text-sm" onSelect={() => submit(query)}>
                      Ask A=M · {query}
                    </Command.Item>
                  </Command.Group>
                ) : (
                  <Command.Group heading="Do">
                    <Command.Item value="new-need" className="px-3 py-3 text-sm" onSelect={() => openFlow("")}>
                      Turn a need into a project
                    </Command.Item>
                    <Command.Item value="next" className="px-3 py-3 text-sm" onSelect={() => submit("What should I do next?")}>
                      What should I do next?
                    </Command.Item>
                    <Command.Item value="skills" className="px-3 py-3 text-sm" onSelect={() => submit("Show me projects that need my skills")}>
                      Projects that need my skills
                    </Command.Item>
                  </Command.Group>
                )}
                {!needle ? (
                  <Command.Group heading="Go">
                    <Command.Item value="home" className="px-3 py-3 text-sm" onSelect={() => go("/")}>
                      Home
                    </Command.Item>
                    <Command.Item value="explore" className="px-3 py-3 text-sm" onSelect={() => go("/network")}>
                      Explore
                    </Command.Item>
                    <Command.Item value="projects" className="px-3 py-3 text-sm" onSelect={() => go("/projects")}>
                      Projects
                    </Command.Item>
                    <Command.Item value="action" className="px-3 py-3 text-sm" onSelect={() => go("/action")}>
                      Action
                    </Command.Item>
                    <Command.Item value="ai" className="px-3 py-3 text-sm" onSelect={() => go("/ai")}>
                      AI
                    </Command.Item>
                  </Command.Group>
                ) : null}
                {foundPeople.length ? (
                  <Command.Group heading="People">
                    {foundPeople.map((person) => (
                      <Command.Item key={person.id} value={person.name} className="flex items-center gap-3 px-3 py-3 text-sm" onSelect={() => go(`/people/${person.id}`)}>
                        <Avatar name={person.name} src={portrait(person.id)} size="sm" />
                        <span>
                          {person.name}
                          <span className="mt-0.5 block text-muted">{person.role}</span>
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : null}
                {foundProjects.length ? (
                  <Command.Group heading="Projects">
                    {foundProjects.map((project) => (
                      <Command.Item key={project.id} value={project.name} className="px-3 py-3 text-sm" onSelect={() => go(`/projects/${project.id}`)}>
                        {project.name}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : null}
                {foundOrgs.length ? (
                  <Command.Group heading="Organizations">
                    {foundOrgs.map((org) => (
                      <Command.Item key={org.id} value={org.name} className="px-3 py-3 text-sm" onSelect={() => go(`/orgs/${org.id}`)}>
                        {org.name}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : null}
                {foundOpps.length ? (
                  <Command.Group heading="Opportunities">
                    {foundOpps.map((opp) => (
                      <Command.Item key={opp.id} value={opp.title} className="px-3 py-3 text-sm" onSelect={() => go(`/opportunities?opp=${opp.id}`)}>
                        {opp.title}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : null}
              </Command.List>
            </Command>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function useNoticesBell() {
  const unread = useAM((state) => state.notices.filter((notice) => !notice.read).length);
  const openNotices = useAM((state) => state.openNotices);
  return (
    <button
      type="button"
      onClick={() => openNotices()}
      className="relative grid size-11 place-items-center rounded-full"
      aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
    >
      <Bell className="size-5" aria-hidden />
      {unread > 0 ? <span className="absolute right-2 top-2 size-2 rounded-full bg-accent" aria-hidden /> : null}
    </button>
  );
}
