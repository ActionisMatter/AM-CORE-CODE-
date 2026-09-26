import { skillName } from "./seed";
import { ME, type Data, type Draft, type Person, type Project, type Proposal, type SkillId } from "./types";
import type { ChainNode } from "./types";

const DUTCH = new Set(["Amersfoort", "Amsterdam", "Utrecht", "Haarlem", "Rotterdam"]);

export const NEED_EXAMPLES = [
  "We need to redesign our website.",
  "We need a developer to build an AI platform.",
  "We want to transform this area of Amersfoort.",
];

export const PLACES = ["Amersfoort", "Amsterdam", "Utrecht", "Haarlem", "Rotterdam", "Netherlands"];

export interface Match {
  person: Person;
  score: number;
  reasons: string[];
}

export function personById(data: Data, id: string) {
  return data.people.find((person) => person.id === id);
}

export function projectById(data: Data, id: string) {
  return data.projects.find((project) => project.id === id);
}

export function orgById(data: Data, id: string) {
  return data.orgs.find((org) => org.id === id);
}

export function availabilityLabel(value: Person["availability"]) {
  if (value === "now") return "Available now";
  if (value === "month") return "Available this month";
  return "Booked ahead";
}

export function projectStatusLabel(value: Project["status"]) {
  if (value === "forming") return "Forming";
  if (value === "active") return "Active";
  if (value === "waiting") return "Waiting";
  return "Complete";
}

export function firstName(name: string) {
  return name.split(" ")[0] ?? name;
}

export function uncovered(data: Data, project: Project): SkillId[] {
  const have = new Set(
    data.people.filter((person) => project.memberIds.includes(person.id)).flatMap((person) => person.skills),
  );
  return project.skillIds.filter((id) => !have.has(id));
}

export function rankMatches(data: Data, project: Project, limit = 4): Match[] {
  const members = new Set(project.memberIds);
  const open = new Set(uncovered(data, project));
  const projectOrg = orgById(data, project.orgId);

  return data.people
    .filter((person) => person.id !== ME && !members.has(person.id))
    .map((person) => {
      const overlap = project.skillIds.filter((id) => person.skills.includes(id));
      if (!overlap.length) return null;
      const reasons: string[] = [];
      let score = overlap.length * 3;
      reasons.push(
        `${overlap.length} matching skill${overlap.length > 1 ? "s" : ""}: ${overlap.map((id) => skillName(id)).join(", ")}`,
      );
      const similar = data.projects.some(
        (other) =>
          other.id !== project.id &&
          other.memberIds.includes(person.id) &&
          other.skillIds.some((id) => project.skillIds.includes(id)),
      );
      if (similar) {
        score += 2;
        reasons.push("Worked on similar projects");
      }
      if (person.availability === "now") {
        score += 2;
        reasons.push("Available now");
      } else if (person.availability === "month") {
        score += 1;
        reasons.push("Available this month");
      } else {
        reasons.push("Booked ahead — a request can still wait");
      }
      const linked = data.connections.some(
        (connection) => connection.personId === person.id && connection.status === "connected",
      );
      if (linked) {
        score += 1;
        reasons.push("Already in your network");
      }
      const org = orgById(data, person.orgId);
      if (org && (person.orgId === project.orgId || projectOrg?.partners.includes(person.orgId))) {
        score += 1;
        reasons.push(`Connected through ${org.name}`);
      }
      if (person.location === project.location) {
        score += 2;
        reasons.push(`Located in ${person.location}`);
      } else if (DUTCH.has(person.location) && DUTCH.has(project.location)) {
        score += 1;
        reasons.push("Located nearby");
      }
      if (overlap.some((id) => open.has(id))) score += 2;
      return { person, score, reasons: reasons.slice(0, 4) };
    })
    .filter((match): match is Match => Boolean(match))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function peopleRelevant(data: Data) {
  const map = new Map<string, Match & { project: Project }>();
  for (const project of data.projects.filter((item) => item.memberIds.includes(ME) && item.status !== "done")) {
    for (const match of rankMatches(data, project, 3)) {
      const prev = map.get(match.person.id);
      if (!prev || prev.score < match.score) map.set(match.person.id, { ...match, project });
    }
  }
  return [...map.values()].sort((a, b) => b.score - a.score).slice(0, 3);
}

export type NextMove =
  | { kind: "connect"; match: Match; project: Project }
  | { kind: "task"; taskId: string; title: string; project: Project }
  | { kind: "ask" };

export function nextMove(data: Data, skipped: string[]): NextMove {
  const projects = data.projects.filter((project) => project.memberIds.includes(ME) && project.status !== "done");
  for (const project of projects) {
    if (!uncovered(data, project).length) continue;
    const match = rankMatches(data, project, 4).find(
      (item) => !skipped.includes(`${project.id}:${item.person.id}`),
    );
    if (!match) continue;
    const pending = data.connections.find(
      (connection) => connection.personId === match.person.id && connection.status === "pending",
    );
    if (pending) continue;
    return { kind: "connect", match, project };
  }
  const task = data.tasks.find((item) => item.status === "today" && item.ownerId === ME);
  const project = task ? projectById(data, task.projectId) : undefined;
  if (task && project) return { kind: "task", taskId: task.id, title: task.title, project };
  return { kind: "ask" };
}

export function contextLine(data: Data, skipped: string[]) {
  const move = nextMove(data, skipped);
  if (move.kind === "connect") {
    const open = uncovered(data, move.project);
    const skill = open[0] ? skillName(open[0]).toLowerCase() : "a capability";
    return `${move.project.name} still needs ${skill} before it can move cleanly.`;
  }
  if (move.kind === "task") return `${move.project.name} has something that should not wait.`;
  return "Name a need, and A=M will find the people who can carry it.";
}

export function projectsNeeding(data: Data, personId: string) {
  const person = personById(data, personId);
  if (!person) return [];
  return data.projects.filter(
    (project) =>
      project.status !== "done" &&
      !project.memberIds.includes(personId) &&
      project.skillIds.some((id) => person.skills.includes(id)),
  );
}

export function oppsFor(data: Data, personId: string) {
  const person = personById(data, personId);
  if (!person) return [];
  return data.opportunities.filter((opp) => opp.skillIds.some((id) => person.skills.includes(id)));
}

export function matchOpportunity(data: Data, oppId: string, limit = 3): Match[] {
  const opp = data.opportunities.find((item) => item.id === oppId);
  if (!opp) return [];
  const project = opp.projectId ? projectById(data, opp.projectId) : undefined;
  if (project) return rankMatches(data, project, limit);
  return data.people
    .filter((person) => person.id !== ME && person.skills.some((id) => opp.skillIds.includes(id)))
    .map((person) => {
      const overlap = person.skills.filter((id) => opp.skillIds.includes(id));
      const reasons = [`Covers ${overlap.map((id) => skillName(id)).join(", ")}`];
      if (person.availability === "now") reasons.push("Available now");
      else if (person.availability === "month") reasons.push("Available this month");
      if (person.location && opp.location.includes(person.location.split(",")[0] ?? "")) reasons.push(`In ${person.location}`);
      return { person, score: overlap.length, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function myProjectTasks(data: Data) {
  const ids = new Set(data.projects.filter((project) => project.memberIds.includes(ME)).map((project) => project.id));
  return data.tasks.filter((task) => ids.has(task.projectId));
}

export function matterChain(data: Data, focusId: string): ChainNode[] {
  const person = personById(data, focusId) ?? personById(data, ME);
  if (!person) return [];
  const org = orgById(data, person.orgId);
  const project =
    data.projects.find((item) => item.memberIds.includes(person.id) && item.status !== "done") ??
    data.projects.find(
      (item) => item.status !== "done" && uncovered(data, item).some((id) => person.skills.includes(id)),
    );
  const nodes: ChainNode[] = [
    { key: person.id, kicker: "Person", title: person.name, kind: "person", id: person.id },
  ];
  if (org) nodes.push({ key: org.id, kicker: "Organization", title: org.name, kind: "org", id: org.id });
  if (!project) return nodes;
  nodes.push({ key: project.id, kicker: "Project", title: project.name, kind: "project", id: project.id });
  const skill = uncovered(data, project)[0];
  if (!skill) return nodes;
  nodes.push({
    key: `${project.id}-${skill}`,
    kicker: "Open skill",
    title: skillName(skill),
    kind: "skill",
    skillId: skill,
  });
  const match = rankMatches(data, { ...project, skillIds: [skill] }, 3).find((item) => item.person.id !== person.id);
  if (match) {
    nodes.push({
      key: `${match.person.id}-partner`,
      kicker: "Possible partner",
      title: match.person.name,
      kind: "person",
      id: match.person.id,
    });
  }
  return nodes;
}

const RULES: { test: RegExp; skills: SkillId[]; requirement: string }[] = [
  {
    test: /website|web site|\bsite\b|redesign|homepage|landing page/i,
    skills: ["ux", "brand", "frontend"],
    requirement: "A public site that explains the work and asks for the right next step.",
  },
  {
    test: /\bai\b|artificial|machine learning|\bmodel\b|assistant/i,
    skills: ["ai", "data"],
    requirement: "An intelligent layer that can read the context and propose an action.",
  },
  {
    test: /developer|full[- ]?stack|engineer|platform|software|\bapp\b/i,
    skills: ["fullstack", "product"],
    requirement: "A working build, owned by someone who can ship it.",
  },
  {
    test: /transform|district|neighbourhood|neighborhood|city|amersfoort|\barea\b|place|urban/i,
    skills: ["urban", "stakeholder", "facilitation"],
    requirement: "A place-based effort with the people who hold the ground.",
  },
  {
    test: /brand|identity|story|narrative/i,
    skills: ["brand", "writing"],
    requirement: "A clear identity people can repeat without a deck.",
  },
  {
    test: /design|ux|service|journey/i,
    skills: ["ux", "research"],
    requirement: "An experience a new person understands in the first minute.",
  },
  {
    test: /research|insight|interview/i,
    skills: ["research"],
    requirement: "Evidence from the people affected, before the plan hardens.",
  },
  {
    test: /facilitat|workshop|community|residents|neighbors|neighbours/i,
    skills: ["facilitation", "stakeholder"],
    requirement: "A room where the real disagreement can happen.",
  },
];

function titleFrom(text: string) {
  if (/website|redesign/i.test(text)) return "Website redesign";
  if (/ai platform|build an ai/i.test(text)) return "AI platform";
  if (/amersfoort/i.test(text)) return "Amersfoort place transformation";
  if (/district|neighbourhood|neighborhood/i.test(text)) return "District transformation";
  const clean = text
    .replace(/^(we need to|we need|we want to|we want|i need to|i need|looking for)\s+/i, "")
    .replace(/[.]+$/, "");
  const short = clean.charAt(0).toUpperCase() + clean.slice(1);
  return short.length > 52 ? `${short.slice(0, 48).trim()}...` : short || "Untitled need";
}

export function structureNeed(text: string): Draft {
  const trimmed = text.trim();
  const hits = RULES.filter((rule) => rule.test.test(trimmed));
  const skillIds = [...new Set(hits.flatMap((rule) => rule.skills))];
  const requirements = hits.map((rule) => rule.requirement);
  if (!skillIds.length) {
    skillIds.push("product", "facilitation");
    requirements.push("A clear outcome for the first two weeks.");
  }
  requirements.push("A named owner and a first session with a decision.");
  let location = "Netherlands";
  if (/amersfoort/i.test(trimmed)) location = "Amersfoort";
  else if (/amsterdam/i.test(trimmed)) location = "Amsterdam";
  else if (/utrecht/i.test(trimmed)) location = "Utrecht";
  else if (/rotterdam/i.test(trimmed)) location = "Rotterdam";
  else if (/haarlem/i.test(trimmed)) location = "Haarlem";
  const objective = /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  return {
    title: titleFrom(trimmed),
    objective,
    summary: requirements[0] ?? objective,
    requirements,
    skillIds,
    location,
  };
}

export function previewProject(draft: Draft): Project {
  return {
    id: "preview",
    name: draft.title,
    status: "forming",
    ownerId: ME,
    orgId: "am",
    objective: draft.objective,
    summary: draft.summary,
    location: draft.location,
    skillIds: draft.skillIds,
    memberIds: [ME],
    timeline: [],
    documents: [],
    outcome: "",
    updatedAt: 0,
  };
}

export function isNeed(text: string) {
  return /\b(we need|we want|i need|i want|looking for|redesign|transform)\b/i.test(text);
}

export function focusProject(data: Data) {
  return (
    projectNamed(data, "") ??
    data.projects.find((project) => project.id === "citylab") ??
    data.projects[0]
  );
}

export function projectNamed(data: Data, text: string) {
  const lower = text.toLowerCase();
  if (!lower.trim()) return undefined;
  return (
    data.projects.find((project) => lower.includes(project.name.toLowerCase())) ??
    data.projects.find((project) => {
      const short = project.name.toLowerCase().replace(/ amersfoort/, "");
      return short.length > 3 && lower.includes(short);
    })
  );
}

export interface Interpretation {
  body: string;
  spots?: { personId: string; reason: string }[];
  projects?: string[];
  opps?: string[];
  proposal?: Proposal;
}

function spotsFrom(matches: Match[]) {
  return matches.map((match) => ({
    personId: match.person.id,
    reason: match.reasons.join(" · "),
  }));
}

export function interpret(text: string, data: Data, skipped: string[]): Interpretation {
  const q = text.trim();
  const lower = q.toLowerCase();
  const named = projectNamed(data, q);

  if (/what should i do next|what matters|next action|next step/.test(lower)) {
    const move = nextMove(data, skipped);
    if (move.kind === "connect") {
      return {
        body: `Next: bring ${move.match.person.name} into ${move.project.name}. ${move.match.reasons[0]}.`,
        spots: [{ personId: move.match.person.id, reason: move.match.reasons.join(" · ") }],
        projects: [move.project.id],
        proposal: {
          type: "connect",
          personId: move.match.person.id,
          projectId: move.project.id,
          why: move.match.reasons[0] ?? "Closest open skill",
        },
      };
    }
    if (move.kind === "task") {
      return {
        body: `Next: ${move.title}. It sits on ${move.project.name}.`,
        projects: [move.project.id],
        proposal: { type: "done-task", taskId: move.taskId },
      };
    }
    return { body: "Nothing is blocking a team. Name the next need and I will structure it." };
  }

  if (/\b(designer|developer|engineer|strategist)s?\b/.test(lower) && /\b(find|who|show|need)\b/.test(lower)) {
    const project =
      named ??
      (/platform|build/.test(lower) ? data.projects.find((item) => item.id === "platform") : undefined) ??
      data.projects.find((item) => item.memberIds.includes(ME) && item.status !== "done") ??
      data.projects[0];
    if (!project) return { body: "There is no project to match against yet." };
    let matches = rankMatches(data, project, 6);
    if (/designer/.test(lower)) {
      matches = matches.filter((match) => match.person.skills.some((id) => id === "ux" || id === "brand"));
    } else if (/developer|engineer/.test(lower)) {
      matches = matches.filter((match) =>
        match.person.skills.some((id) => id === "fullstack" || id === "frontend" || id === "ai"),
      );
    } else if (/strategist/.test(lower)) {
      matches = matches.filter((match) => match.person.skills.some((id) => id === "urban" || id === "product"));
    }
    const take = /three|\b3\b/.test(lower) ? 3 : 3;
    const chosen = matches.slice(0, take);
    if (!chosen.length) {
      return {
        body: `No one in the network covers that for ${project.name} yet. Add the skill to a profile, or widen the ask.`,
        projects: [project.id],
      };
    }
    const lead = chosen[0];
    if (!lead) return { body: "No match." };
    return {
      body: `${chosen.length === 1 ? "One person" : `${chosen.length} people`} can help ${project.name}. The closest is ${lead.person.name}: ${lead.reasons[0]}.`,
      spots: spotsFrom(chosen),
      projects: [project.id],
      proposal: {
        type: "connect",
        personId: lead.person.id,
        projectId: project.id,
        why: lead.reasons[0] ?? "Skill match",
      },
    };
  }

  if (/who can help/.test(lower)) {
    const project = named ?? focusProject(data);
    if (!project) return { body: "Create a project first." };
    const matches = rankMatches(data, project, 3);
    if (!matches.length) {
      return { body: `${project.name} has no open match in the network. The skill list may already be covered.` };
    }
    const lead = matches[0];
    if (!lead) return { body: "No match." };
    return {
      body: `For ${project.name}, start with ${lead.person.name}. ${lead.reasons[0]}.`,
      spots: spotsFrom(matches),
      projects: [project.id],
      proposal: {
        type: "connect",
        personId: lead.person.id,
        projectId: project.id,
        why: lead.reasons[0] ?? "Closest match",
      },
    };
  }

  if (/need my skills|my skills|projects that need/.test(lower)) {
    const list = projectsNeeding(data, ME);
    const opps = oppsFor(data, ME);
    const me = personById(data, ME);
    const skillList = me ? me.skills.map((id) => skillName(id)).join(", ") : "";
    if (!list.length && !opps.length) {
      return { body: `Nothing open asks for ${skillList || "your skills"} yet.` };
    }
    const names = list.map((project) => project.name).join(", ");
    return {
      body: list.length
        ? `Your skills (${skillList}) are asked for on ${names}.`
        : `No other project is asking for you yet. These opportunities sit close to ${skillList}.`,
      projects: list.map((project) => project.id),
      opps: opps.slice(0, 3).map((opp) => opp.id),
    };
  }

  if (/prepare (this |the )?meeting|meeting brief/.test(lower)) {
    const project = named ?? data.projects.find((item) => item.id === "citylab") ?? focusProject(data);
    if (!project) return { body: "No project to prepare." };
    const members = project.memberIds
      .map((id) => personById(data, id)?.name)
      .filter(Boolean)
      .join(", ");
    const open = uncovered(data, project).map((id) => skillName(id));
    const waiting = data.tasks.find((task) => task.projectId === project.id && task.status === "waiting");
    return {
      body: [
        `Meeting brief · ${project.name}`,
        "",
        project.objective,
        "",
        `In the room: ${members || "Not staffed"}.`,
        open.length ? `Still open: ${open.join(", ")}.` : "The required skills are in the room.",
        waiting ? `Waiting on: ${waiting.title}.` : "Nothing is formally waiting.",
        "",
        "Agenda",
        "1. What is true since you last met.",
        "2. The decision this meeting must make.",
        "3. Who is still missing, and why.",
        "4. The next action, with a name on it.",
      ].join("\n"),
      projects: [project.id],
    };
  }

  if (/project plan|create the plan|make a plan|the plan/.test(lower)) {
    const project = named ?? focusProject(data);
    if (!project) return { body: "No project to plan." };
    return {
      body: `I can place the open steps of ${project.name} onto your action list. Nothing is created until you confirm.`,
      projects: [project.id],
      proposal: { type: "make-plan", projectId: project.id },
    };
  }

  if (/turn this into a project/.test(lower) || isNeed(q)) {
    const inline = q.replace(/turn this into a project[:\s]*/i, "").trim();
    const question = inline.length >= 8 ? inline : q;
    if (question.length < 8 || /^turn this into a project\.?$/i.test(question)) {
      return {
        body: "State the need in one sentence. I will turn it into requirements, skills, and people — and wait for you to confirm.",
      };
    }
    const draft = structureNeed(question);
    return {
      body: `${draft.title}. Skills: ${draft.skillIds.map((id) => skillName(id)).join(", ")}. I will not create it until you review the shape and the people.`,
      proposal: { type: "review-need", question, draft },
    };
  }

  const needle = lower;
  const people = data.people
    .filter((person) => `${person.name} ${person.role} ${person.location}`.toLowerCase().includes(needle))
    .slice(0, 4);
  const projects = data.projects
    .filter((project) => `${project.name} ${project.objective}`.toLowerCase().includes(needle))
    .slice(0, 3);
  const opps = data.opportunities
    .filter((opp) => `${opp.title} ${opp.summary}`.toLowerCase().includes(needle))
    .slice(0, 3);
  if (people.length || projects.length || opps.length) {
    return {
      body: "This is what sits closest to that in the network.",
      spots: people.map((person) => ({ personId: person.id, reason: `${person.role} · ${person.location}` })),
      projects: projects.map((project) => project.id),
      opps: opps.map((opp) => opp.id),
    };
  }

  return {
    body: "I can turn a need into a project, find people for a skill, prepare a meeting, or name your next action. Try one of those.",
  };
}

export function oppReasons(data: Data, oppId: string) {
  const opp = data.opportunities.find((item) => item.id === oppId);
  const me = personById(data, ME);
  if (!opp || !me) return [];
  const overlap = opp.skillIds.filter((id) => me.skills.includes(id));
  const reasons: string[] = [];
  if (overlap.length) reasons.push(`You share ${overlap.map((id) => skillName(id)).join(" and ")}`);
  if (opp.location === me.location) reasons.push(`In ${opp.location}`);
  else if (DUTCH.has(opp.location)) reasons.push("Nearby");
  const org = orgById(data, opp.orgId);
  if (org) reasons.push(org.name);
  return reasons;
}
