import { Building2, Landmark, UserRound, Users } from "lucide-react";
import { useEffect, useState, type ButtonHTMLAttributes } from "react";
import type { SkillId } from "@/lib/am/types";
import { RING, portrait } from "@/lib/am/photos";
import { useAM } from "@/lib/am/store";
import { cn } from "@/lib/cn";
import { Mark } from "./ui";

type Screen =
  | "launch"
  | "transition"
  | "landing"
  | "login"
  | "create"
  | "role"
  | "profile"
  | "expertise"
  | "interests"
  | "availability"
  | "review"
  | "org"
  | "welcome";

type Role = "person" | "company" | "partner" | "organization";

const EXPERTISE: { label: string; skill: SkillId }[] = [
  { label: "Strategy", skill: "product" },
  { label: "Business Development", skill: "stakeholder" },
  { label: "Project Management", skill: "facilitation" },
  { label: "AI & Automation", skill: "ai" },
  { label: "Marketing", skill: "brand" },
  { label: "Design", skill: "ux" },
  { label: "Finance", skill: "data" },
  { label: "Real Estate", skill: "urban" },
  { label: "City Development", skill: "urban" },
  { label: "Sustainability", skill: "research" },
  { label: "Education", skill: "writing" },
  { label: "Art & Culture", skill: "brand" },
  { label: "Other", skill: "product" },
];

const INTERESTS = [
  { id: "Projects", body: "Join or start projects", icon: "folder" },
  { id: "Opportunities", body: "Find collaboration opportunities", icon: "spark" },
  { id: "People", body: "Connect with interesting people", icon: "people" },
  { id: "Knowledge", body: "Learn and share knowledge", icon: "book" },
  { id: "Investment", body: "Explore investment opportunities", icon: "coin" },
  { id: "Events", body: "Join events and activities", icon: "cal" },
] as const;

const AVAIL = [
  { id: "projects", title: "Open for projects", body: "Available for new projects", value: "now" as const },
  { id: "collab", title: "Open for collaboration", body: "I'm open to collaboration", value: "now" as const },
  { id: "freelance", title: "Available for freelance", body: "I'm available for freelance work", value: "month" as const },
  { id: "explore", title: "Currently exploring", body: "I'm just exploring for now", value: "later" as const },
];

const ROLES: { id: Role; title: string; body: string; icon: typeof UserRound }[] = [
  { id: "person", title: "As a Person", body: "Show your expertise, find projects and connect.", icon: UserRound },
  { id: "company", title: "As a Company", body: "Find talent, create projects and grow your organization.", icon: Building2 },
  { id: "partner", title: "As a Partner", body: "Collaborate, provide services and create value together.", icon: Users },
  { id: "organization", title: "As an Organization", body: "Create opportunities, connect people and drive impact.", icon: Landmark },
];

const darkField =
  "w-full rounded-2xl border border-cream/15 bg-void-card px-4 py-3 text-base text-cream outline-none placeholder:text-cream/35 focus-visible:border-gold";

function GoldButton({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-b from-gold to-gold-deep text-sm font-semibold text-void disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function LineButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-cream/25 text-sm font-medium text-cream"
      {...props}
    >
      {children}
    </button>
  );
}

function Status() {
  const [time, setTime] = useState("9:41");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="flex items-center justify-between px-6 pt-3 text-xs font-semibold text-cream">
      <span>{time}</span>
      <span className="flex items-end gap-0.5" aria-hidden>
        <span className="h-1 w-0.5 rounded-sm bg-cream" />
        <span className="h-1.5 w-0.5 rounded-sm bg-cream" />
        <span className="h-2 w-0.5 rounded-sm bg-cream" />
        <span className="h-2.5 w-0.5 rounded-sm bg-cream" />
      </span>
    </div>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="min-h-11 px-1 text-sm text-cream/80" aria-label="Back">
      ←
    </button>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-1.6 3.6-5.5 3.6A6.3 6.3 0 1 1 12 5.8c1.8 0 3 .8 3.6 1.4l2.5-2.4C16.7 3.2 14.6 2.2 12 2.2 6.8 2.2 2.6 6.4 2.6 11.6S6.8 21 12 21c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1-.1-1.5H12z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M16.4 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.5-2.5-1.7-3.1-1.7-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.8-.7-1.5.1-2.8.9-3.5 2.2-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.5 2.2 2.6 2.1 1-.1 1.4-.7 2.7-.7s1.6.7 2.7.7 1.8-1 2.5-2c.8-1.1 1.1-2.2 1.1-2.2s-2.1-.8-2.1-3.8zM14.6 6.9c.6-.7 1-1.7.9-2.7-1 .1-2.1.7-2.7 1.5-.6.7-1.1 1.7-.9 2.6 1.1.1 2.1-.5 2.7-1.4z" />
    </svg>
  );
}

export function Onboarding({ onEnter }: { onEnter: () => void }) {
  const updateMe = useAM((state) => state.updateMe);
  const addOrg = useAM((state) => state.addOrg);
  const [screen, setScreen] = useState<Screen>("launch");
  const [account, setAccount] = useState({ name: "", email: "", password: "", remember: false });
  const [note, setNote] = useState("");
  const [role, setRole] = useState<Role>("person");
  const [profile, setProfile] = useState({ name: "Luke Zetzema", role: "", location: "Amsterdam, Netherlands" });
  const [picked, setPicked] = useState<string[]>(["Strategy", "Business Development", "AI & Automation"]);
  const [looking, setLooking] = useState<string[]>(["Projects", "People"]);
  const [avail, setAvail] = useState("projects");
  const [customAvail, setCustomAvail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgFocus, setOrgFocus] = useState("");

  useEffect(() => {
    if (screen !== "launch" && screen !== "transition") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setScreen(screen === "launch" ? "transition" : "landing"), reduce ? 500 : 2200);
    return () => window.clearTimeout(timer);
  }, [screen]);

  function toggle(list: string[], value: string, set: (next: string[]) => void) {
    set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  function finishPerson() {
    const skills = [...new Set(EXPERTISE.filter((item) => picked.includes(item.label)).map((item) => item.skill))];
    const choice = AVAIL.find((item) => item.id === avail) ?? AVAIL[0];
    updateMe({
      name: profile.name.trim() || account.name.trim() || "Luke Zetzema",
      role: profile.role.trim() || "Founder · Connector · Builder",
      location: profile.location,
      skills: skills.length ? skills : ["product", "facilitation"],
      services: picked,
      interests: looking,
      goals: customAvail.trim() ? [customAvail.trim()] : ["Build with the right people"],
      availability: choice.value,
      about: "Here to connect people, projects and opportunities.",
    });
    onEnter();
  }

  function finishOrg() {
    const name = orgName.trim() || "New organization";
    const id = addOrg(name);
    updateMe({
      name: account.name.trim() || name,
      role: role === "partner" ? "Partner" : role === "organization" ? "Organization" : "Company",
      orgId: id,
      location: "Netherlands",
      about: orgFocus.trim() || `${name} is in the A=M network.`,
    });
    onEnter();
  }

  return (
    <div className="min-h-dvh bg-void text-cream">
      {screen === "launch" ? (
        <section className="relative min-h-dvh overflow-hidden">
          <img src="/am/city.jpg" alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-void/25 via-void/55 to-void" />
          <div className="relative flex min-h-dvh flex-col">
            <Status />
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <h1 className="font-display text-4xl tracking-wide text-gold">ACTION = MATTER</h1>
              <p className="mt-4 text-xs font-medium tracking-widest text-gold">PEOPLE · PROJECTS · OPPORTUNITIES</p>
            </div>
            <div className="px-8 pb-14 text-center">
              <p className="text-xs tracking-widest text-cream/80">BUILD A BETTER TOMORROW, TOGETHER.</p>
              <div className="mx-auto mt-6 h-0.5 w-28 rounded-full bg-cream/20">
                <div className="h-full w-2/3 rounded-full bg-gold" />
              </div>
              <button type="button" className="mt-5 min-h-11 text-xs text-cream/70" onClick={() => setScreen("landing")}>
                Skip
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {screen === "transition" ? (
        <section className="flex min-h-dvh flex-col">
          <Status />
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="relative grid size-64 place-items-center">
              <span className="am-glow absolute inset-6 rounded-full bg-gold/30 blur-2xl" />
              {Array.from({ length: 18 }).map((_, index) => {
                const angle = (index / 18) * Math.PI * 2;
                return (
                  <span
                    key={index}
                    className="absolute size-1.5 rounded-full bg-gold"
                    style={{
                      left: `${50 + Math.cos(angle) * 42}%`,
                      top: `${50 + Math.sin(angle) * 42}%`,
                      opacity: 0.35 + (index % 5) * 0.12,
                    }}
                  />
                );
              })}
              <Mark tone="gold" />
            </div>
            <p className="mt-8 text-xs tracking-widest text-gold">ACTION = MATTER</p>
            <div className="mt-8 h-0.5 w-28 rounded-full bg-cream/20">
              <div className="h-full w-1/2 rounded-full bg-gold" />
            </div>
            <button type="button" className="mt-6 min-h-11 text-xs text-cream/70" onClick={() => setScreen("landing")}>
              Skip
            </button>
          </div>
        </section>
      ) : null}

      {screen === "landing" ? (
        <section className="relative flex min-h-dvh flex-col overflow-hidden">
          <img src="/am/earth.jpg" alt="" className="absolute inset-0 size-full object-cover object-bottom" />
          <div className="absolute inset-0 bg-gradient-to-b from-void via-void/80 to-void/30" />
          <div className="relative flex min-h-dvh flex-col">
            <Status />
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <Mark tone="gold" />
              <p className="mt-4 text-xs tracking-widest text-gold">PEOPLE · PROJECTS · OPPORTUNITIES</p>
            </div>
            <div className="space-y-3 px-6 pb-12">
              <GoldButton onClick={() => setScreen("login")}>Log in</GoldButton>
              <LineButton onClick={() => setScreen("create")}>Create account</LineButton>
              <button type="button" className="min-h-11 w-full text-sm text-cream/80" onClick={onEnter}>
                Explore as guest
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {screen === "login" ? (
        <section className="flex min-h-dvh flex-col px-6 pb-10">
          <Status />
          <Back onClick={() => setScreen("landing")} />
          <h1 className="mt-4 text-3xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-cream/60">Log in to your A=M account</p>
          <form
            className="mt-8 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!account.email.trim() || !account.password.trim()) {
                setNote("Enter an email and a password to continue.");
                return;
              }
              onEnter();
            }}
          >
            <label className="block text-sm text-cream/70">
              Email
              <input className={cn(darkField, "mt-2")} type="email" autoComplete="email" value={account.email} onChange={(event) => setAccount({ ...account, email: event.target.value })} />
            </label>
            <label className="block text-sm text-cream/70">
              Password
              <input className={cn(darkField, "mt-2")} type="password" autoComplete="current-password" value={account.password} onChange={(event) => setAccount({ ...account, password: event.target.value })} />
            </label>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={account.remember} onChange={(event) => setAccount({ ...account, remember: event.target.checked })} />
                Remember me
              </label>
              <button type="button" className="text-gold" onClick={() => setNote("This preview keeps you on this device. Any password continues.")}>
                Forgot password?
              </button>
            </div>
            {note ? <p className="text-sm text-gold">{note}</p> : null}
            <GoldButton type="submit">Log in</GoldButton>
          </form>
          <p className="my-4 text-center text-xs text-cream/50">or</p>
          <div className="space-y-3">
            <LineButton onClick={onEnter}>
              <GoogleMark /> Continue with Google
            </LineButton>
            <LineButton onClick={onEnter}>
              <AppleMark /> Continue with Apple
            </LineButton>
          </div>
          <p className="mt-6 text-center text-sm text-cream/60">
            Don't have an account?{" "}
            <button type="button" className="text-gold" onClick={() => setScreen("create")}>
              Create account
            </button>
          </p>
        </section>
      ) : null}

      {screen === "create" ? (
        <section className="flex min-h-dvh flex-col px-6 pb-10">
          <Status />
          <Back onClick={() => setScreen("landing")} />
          <h1 className="mt-4 text-3xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-cream/60">Join a network of people, projects and opportunities.</p>
          <form
            className="mt-8 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!account.name.trim() || !account.email.trim() || account.password.trim().length < 4) {
                setNote("Add your name, email, and a password of at least 4 characters.");
                return;
              }
              setProfile((current) => ({ ...current, name: account.name.trim() }));
              setNote("");
              setScreen("role");
            }}
          >
            <label className="block text-sm text-cream/70">
              Full name
              <input className={cn(darkField, "mt-2")} value={account.name} onChange={(event) => setAccount({ ...account, name: event.target.value })} />
            </label>
            <label className="block text-sm text-cream/70">
              Email
              <input className={cn(darkField, "mt-2")} type="email" value={account.email} onChange={(event) => setAccount({ ...account, email: event.target.value })} />
            </label>
            <label className="block text-sm text-cream/70">
              Password
              <input className={cn(darkField, "mt-2")} type="password" value={account.password} onChange={(event) => setAccount({ ...account, password: event.target.value })} />
            </label>
            {note ? <p className="text-sm text-gold">{note}</p> : null}
            <GoldButton type="submit">Create account</GoldButton>
          </form>
          <p className="my-4 text-center text-xs text-cream/50">or</p>
          <div className="space-y-3">
            <LineButton
              onClick={() => {
                setProfile((current) => ({ ...current, name: current.name || "Luke Zetzema" }));
                setScreen("role");
              }}
            >
              <GoogleMark /> Continue with Google
            </LineButton>
            <LineButton
              onClick={() => {
                setProfile((current) => ({ ...current, name: current.name || "Luke Zetzema" }));
                setScreen("role");
              }}
            >
              <AppleMark /> Continue with Apple
            </LineButton>
          </div>
          <p className="mt-6 text-center text-xs text-cream/50">
            By creating an account you agree to our Terms & Privacy Policy. This preview stores your profile on this device.
          </p>
        </section>
      ) : null}

      {screen === "role" ? (
        <section className="flex min-h-dvh flex-col px-6 pb-8">
          <Status />
          <Back onClick={() => setScreen("create")} />
          <h1 className="mt-4 text-center text-3xl font-semibold">How do you want to use A=M?</h1>
          <p className="mt-2 text-center text-sm text-cream/60">Choose the option that fits you best. You can always change this later.</p>
          <div className="mt-6 space-y-3">
            {ROLES.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setRole(item.id);
                    setScreen(item.id === "person" ? "profile" : "org");
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-cream/15 bg-void-card px-4 py-4 text-left"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-cream/5 text-gold">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{item.title}</span>
                    <span className="block text-sm text-cream/60">{item.body}</span>
                  </span>
                  <span aria-hidden className="text-cream/40">
                    ›
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {screen === "org" ? (
        <section className="flex min-h-dvh flex-col px-6 pb-8">
          <Status />
          <Back onClick={() => setScreen("role")} />
          <h1 className="mt-4 text-3xl font-semibold">
            {role === "company" ? "Your company" : role === "partner" ? "Your practice" : "Your organization"}
          </h1>
          <p className="mt-2 text-sm text-cream/60">A short introduction is enough. You can shape the profile inside the network.</p>
          <label className="mt-6 block text-sm text-cream/70">
            Name
            <input className={cn(darkField, "mt-2")} value={orgName} onChange={(event) => setOrgName(event.target.value)} placeholder="TechForward" />
          </label>
          <label className="mt-4 block text-sm text-cream/70">
            What do you bring?
            <textarea className={cn(darkField, "mt-2 min-h-28")} value={orgFocus} onChange={(event) => setOrgFocus(event.target.value)} placeholder="The capabilities you want the network to see." />
          </label>
          <div className="mt-auto pt-8">
            <GoldButton
              disabled={!orgName.trim()}
              onClick={() => setScreen("welcome")}
            >
              Continue
            </GoldButton>
          </div>
        </section>
      ) : null}

      {screen === "profile" ? (
        <section className="flex min-h-dvh flex-col px-6 pb-8">
          <Status />
          <Back onClick={() => setScreen("role")} />
          <h1 className="mt-2 text-center text-3xl font-semibold">Let's build your profile</h1>
          <p className="mt-2 text-center text-sm text-cream/60">Show the A=M network who you are and how you want to contribute.</p>
          <img src={portrait("luke")} alt="" className="mx-auto mt-5 size-24 rounded-full object-cover ring-2 ring-gold/50" />
          <label className="mt-6 block text-sm text-cream/70">
            Full name
            <input className={cn(darkField, "mt-2")} value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
          </label>
          <label className="mt-4 block text-sm text-cream/70">
            Role / Title
            <input className={cn(darkField, "mt-2")} value={profile.role} placeholder="Choose or type" onChange={(event) => setProfile({ ...profile, role: event.target.value })} />
          </label>
          <label className="mt-4 block text-sm text-cream/70">
            Location
            <input className={cn(darkField, "mt-2")} value={profile.location} onChange={(event) => setProfile({ ...profile, location: event.target.value })} />
          </label>
          <div className="mt-auto pt-8">
            <GoldButton disabled={!profile.name.trim()} onClick={() => setScreen("expertise")}>
              Next
            </GoldButton>
          </div>
        </section>
      ) : null}

      {screen === "expertise" ? (
        <section className="flex min-h-dvh flex-col px-6 pb-8">
          <Status />
          <Back onClick={() => setScreen("profile")} />
          <h1 className="mt-2 text-center text-3xl font-semibold">What can you bring to A=M?</h1>
          <p className="mt-2 text-center text-sm text-cream/60">Select your main areas of expertise. You can add more later.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {EXPERTISE.map((item) => {
              const on = picked.includes(item.label);
              return (
                <button
                  key={item.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(picked, item.label, setPicked)}
                  className={cn("min-h-11 rounded-full px-4 text-sm", on ? "bg-cream text-void" : "border border-cream/20 text-cream")}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="mt-auto pt-8">
            <GoldButton disabled={!picked.length} onClick={() => setScreen("interests")}>
              Next
            </GoldButton>
          </div>
        </section>
      ) : null}

      {screen === "interests" ? (
        <section className="flex min-h-dvh flex-col px-6 pb-8">
          <Status />
          <Back onClick={() => setScreen("expertise")} />
          <h1 className="mt-2 text-center text-3xl font-semibold">What are you looking for?</h1>
          <p className="mt-2 text-center text-sm text-cream/60">Select what you are interested in.</p>
          <div className="mt-6 space-y-3">
            {INTERESTS.map((item) => {
              const on = looking.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(looking, item.id, setLooking)}
                  className={cn("flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left", on ? "border-gold bg-gold/10" : "border-cream/15 bg-void-card")}
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-cream/5 text-gold">{item.id.slice(0, 1)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{item.id}</span>
                    <span className="block text-sm text-cream/60">{item.body}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-8">
            <GoldButton onClick={() => setScreen("availability")}>Next</GoldButton>
          </div>
        </section>
      ) : null}

      {screen === "availability" ? (
        <section className="flex min-h-dvh flex-col px-6 pb-8">
          <Status />
          <Back onClick={() => setScreen("interests")} />
          <h1 className="mt-2 text-center text-3xl font-semibold">Your availability</h1>
          <p className="mt-2 text-center text-sm text-cream/60">Let others know how you want to contribute.</p>
          <div className="mt-6 space-y-3">
            {AVAIL.map((item) => {
              const on = avail === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setAvail(item.id)}
                  className={cn("flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left", on ? "border-gold bg-gold/10" : "border-cream/15 bg-void-card")}
                >
                  <span className={cn("grid size-5 place-items-center rounded-full border", on ? "border-gold bg-gold" : "border-cream/30")}>
                    {on ? <span className="size-2 rounded-full bg-void" /> : null}
                  </span>
                  <span>
                    <span className="block font-medium">{item.title}</span>
                    <span className="block text-sm text-cream/60">{item.body}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <label className="mt-4 block text-sm text-cream/70">
            Custom availability
            <input className={cn(darkField, "mt-2")} value={customAvail} placeholder="e.g. 2 days per week" onChange={(event) => setCustomAvail(event.target.value)} />
          </label>
          <div className="mt-8">
            <GoldButton onClick={() => setScreen("review")}>Next</GoldButton>
          </div>
        </section>
      ) : null}

      {screen === "review" ? (
        <section className="flex min-h-dvh flex-col px-6 pb-8">
          <Status />
          <Back onClick={() => setScreen("availability")} />
          <h1 className="mt-2 text-center text-3xl font-semibold">Almost there!</h1>
          <p className="mt-2 text-center text-sm text-cream/60">Here's a summary of your profile. You can always change this later.</p>
          <article className="mt-6 rounded-3xl border border-cream/15 bg-void-card p-5">
            <div className="flex items-center gap-3">
              <img src={portrait("luke")} alt="" className="size-14 rounded-full object-cover" />
              <div>
                <h2 className="text-lg font-semibold">{profile.name}</h2>
                <p className="text-sm text-cream/60">{profile.role || "Founder · Connector · Builder"}</p>
                <p className="text-sm text-cream/50">{profile.location}</p>
              </div>
            </div>
            <p className="mt-5 text-xs font-semibold tracking-widest text-cream/50">EXPERTISE</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {picked.slice(0, 4).map((item) => (
                <li key={item} className="rounded-full bg-cream/10 px-3 py-1 text-xs">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-semibold tracking-widest text-cream/50">LOOKING FOR</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {looking.map((item) => (
                <li key={item} className="rounded-full bg-cream/10 px-3 py-1 text-xs">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-semibold tracking-widest text-cream/50">AVAILABILITY</p>
            <p className="mt-1 text-sm">{AVAIL.find((item) => item.id === avail)?.title}</p>
          </article>
          <div className="mt-auto pt-8">
            <GoldButton onClick={() => setScreen("welcome")}>Complete setup</GoldButton>
          </div>
        </section>
      ) : null}

      {screen === "welcome" ? (
        <section className="flex min-h-dvh flex-col px-6 pb-10">
          <Status />
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-semibold">Welcome to A=M</h1>
            <p className="mt-2 text-sm text-cream/60">You're all set. Let's create value together.</p>
            <div className="relative mt-10 size-72">
              <span className="am-glow absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/25 blur-2xl" />
              <span className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-gold/40 bg-void shadow-glow">
                <Mark tone="gold" className="text-3xl" />
              </span>
              {RING.map((src, index) => {
                const angle = (index / RING.length) * Math.PI * 2 - Math.PI / 2;
                return (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="absolute size-12 -translate-x-1/2 -translate-y-1/2 rounded-full object-cover ring-2 ring-gold/50"
                    style={{ left: `${50 + Math.cos(angle) * 40}%`, top: `${50 + Math.sin(angle) * 40}%` }}
                  />
                );
              })}
            </div>
          </div>
          <GoldButton onClick={role === "person" ? finishPerson : finishOrg}>Go to your network</GoldButton>
        </section>
      ) : null}
    </div>
  );
}
