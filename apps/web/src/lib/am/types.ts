export const ME = "luke";

export type SkillId =
  | "ux"
  | "brand"
  | "frontend"
  | "fullstack"
  | "ai"
  | "product"
  | "urban"
  | "stakeholder"
  | "research"
  | "facilitation"
  | "data"
  | "writing";

export type Availability = "now" | "month" | "later";
export type ProjectStatus = "forming" | "active" | "waiting" | "done";
export type TaskStatus = "today" | "week" | "waiting" | "blocked" | "done";
export type ConnectionStatus = "pending" | "connected";

export interface Skill {
  id: SkillId;
  name: string;
  cluster: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  location: string;
  about: string;
  skills: SkillId[];
  interests: string[];
  goals: string[];
  availability: Availability;
  orgId: string;
  services: string[];
  experience: { title: string; org: string; span: string }[];
}

export interface Org {
  id: string;
  name: string;
  kind: string;
  location: string;
  about: string;
  capabilities: string[];
  services: string[];
  needs: string[];
  team: string[];
  partners: string[];
  capacity: string;
  resources: string[];
  exposed: boolean;
}

export interface TimelineItem {
  id: string;
  label: string;
  when: string;
  done: boolean;
}

export interface ProjectDoc {
  id: string;
  title: string;
  kind: string;
  body: string;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  ownerId: string;
  orgId: string;
  objective: string;
  summary: string;
  location: string;
  skillIds: SkillId[];
  memberIds: string[];
  timeline: TimelineItem[];
  documents: ProjectDoc[];
  outcome: string;
  sourceQuestion?: string;
  updatedAt: number;
  tags?: string[];
  stats?: { people: number; organizations: number; opportunities: number };
  needs?: { title: string; detail: string; personId: string }[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  ownerId: string;
  note?: string;
}

export interface Connection {
  id: string;
  personId: string;
  projectId?: string;
  status: ConnectionStatus;
  why: string;
}

export interface Message {
  id: string;
  threadId: string;
  authorId: string;
  body: string;
  atLabel: string;
}

export interface Opportunity {
  id: string;
  title: string;
  kind: "Project" | "Partnership" | "Role" | "Event" | "Service";
  orgId: string;
  projectId?: string;
  skillIds: SkillId[];
  budget: string;
  location: string;
  timeline: string;
  summary: string;
  leadId: string;
  tags?: string[];
  seeking?: { personId: string; label: string }[];
}

export interface Notice {
  id: string;
  text: string;
  href: string;
  when: string;
  read: boolean;
}

export interface FlowStep {
  id: string;
  title: string;
  detail: string;
  state: "done" | "now" | "next";
}

export interface Workflow {
  id: string;
  projectId: string;
  steps: FlowStep[];
}

export interface Draft {
  title: string;
  objective: string;
  summary: string;
  requirements: string[];
  skillIds: SkillId[];
  location: string;
}

export type Proposal =
  | { type: "review-need"; question: string; draft: Draft }
  | { type: "connect"; personId: string; projectId: string; why: string }
  | { type: "done-task"; taskId: string }
  | { type: "make-plan"; projectId: string };

export interface AiTurn {
  id: string;
  role: "user" | "am";
  body: string;
  spots?: { personId: string; reason: string }[];
  projects?: string[];
  opps?: string[];
  proposal?: Proposal;
}

export interface ChainNode {
  key: string;
  kicker: string;
  title: string;
  kind: "person" | "org" | "project" | "skill";
  id?: string;
  skillId?: SkillId;
}

export interface Data {
  people: Person[];
  orgs: Org[];
  projects: Project[];
  tasks: Task[];
  connections: Connection[];
  messages: Message[];
  opportunities: Opportunity[];
  notices: Notice[];
  workflows: Workflow[];
}
