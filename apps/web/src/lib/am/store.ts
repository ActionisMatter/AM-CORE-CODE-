import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { interpret, type Interpretation } from "./logic";
import { fresh, skillName } from "./seed";
import {
  ME,
  type AiTurn,
  type Data,
  type Draft,
  type Org,
  type Person,
  type Project,
  type Task,
  type TaskStatus,
  type Workflow,
} from "./types";

export interface Toast {
  id: string;
  text: string;
}

interface Ui {
  flow: boolean;
  flowSeed: string;
  nonce: number;
  notices: boolean;
  command: boolean;
}

interface AM extends Data {
  skipped: string[];
  savedOppIds: string[];
  ai: AiTurn[];
  resolved: string[];
  toasts: Toast[];
  epoch: number;
  ui: Ui;
  openFlow: (seed?: string) => void;
  closeFlow: () => void;
  openCommand: () => void;
  closeCommand: () => void;
  openNotices: () => void;
  closeNotices: () => void;
  pushToast: (text: string) => void;
  updateMe: (patch: Partial<Person>) => void;
  updateOrg: (id: string, patch: Partial<Org>) => void;
  addOrg: (name: string) => string;
  createFromDraft: (draft: Draft, inviteIds: string[]) => string;
  connect: (personId: string, projectId: string | undefined, why: string) => void;
  accept: (id: string) => void;
  sendMessage: (threadId: string, body: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  addTask: (projectId: string, title: string, status?: TaskStatus) => void;
  advance: (projectId: string) => void;
  makePlan: (projectId: string) => void;
  takeOpportunity: (oppId: string) => void;
  later: (projectId: string, personId: string) => void;
  toggleSave: (oppId: string) => void;
  readNotice: (id: string) => void;
  readAll: () => void;
  ask: (text: string) => AiTurn;
  resolve: (id: string) => void;
  reset: () => void;
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

const REPLIES = [
  "Seen. I'll come back with something concrete.",
  "Good. Let's keep the next step small enough to finish.",
  "That helps. I'll mark what I can take.",
];

const ACCEPT: Record<string, string> = {
  anna: "I'm in. Send me the journey and the constraint.",
  elise: "I can hold the identity. Show me what must not be generic.",
  mateo: "I can build it. What has to be true in two weeks?",
  noor: "The system should be able to say why. I'll start there.",
  jonas: "Send the decision you need from me.",
  kim: "I'll bring the people who are already showing up.",
  sara: "I can walk it with you. The municipality moves when the ask is specific.",
};

function memoryStorage() {
  const mem = new Map<string, string>();
  return {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => {
      mem.set(key, value);
    },
    removeItem: (key: string) => {
      mem.delete(key);
    },
  };
}

export const useAM = create<AM>()(
  persist(
    (set, get) => ({
      ...fresh(),
      skipped: [],
      savedOppIds: [],
      ai: [],
      resolved: [],
      toasts: [],
      epoch: 0,
      ui: { flow: false, flowSeed: "", nonce: 0, notices: false, command: false },

      openFlow: (seed) =>
        set((state) => ({
          ui: { ...state.ui, flow: true, flowSeed: seed ?? "", nonce: state.ui.nonce + 1, command: false },
        })),
      closeFlow: () => set((state) => ({ ui: { ...state.ui, flow: false } })),
      openCommand: () => set((state) => ({ ui: { ...state.ui, command: true } })),
      closeCommand: () => set((state) => ({ ui: { ...state.ui, command: false } })),
      openNotices: () => set((state) => ({ ui: { ...state.ui, notices: true } })),
      closeNotices: () => set((state) => ({ ui: { ...state.ui, notices: false } })),

      pushToast: (text) => {
        const id = uid("t");
        set((state) => ({ toasts: [...state.toasts.slice(-2), { id, text }] }));
        if (typeof window === "undefined") return;
        window.setTimeout(() => {
          set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
        }, 3400);
      },

      updateMe: (patch) =>
        set((state) => ({
          people: state.people.map((person) => (person.id === ME ? { ...person, ...patch, id: ME } : person)),
        })),

      updateOrg: (id, patch) =>
        set((state) => ({
          orgs: state.orgs.map((org) => (org.id === id ? { ...org, ...patch, id } : org)),
        })),

      addOrg: (name) => {
        const id = uid("org");
        const org: Org = {
          id,
          name: name.trim(),
          kind: "Organization",
          location: "Netherlands",
          about: "",
          capabilities: [],
          services: [],
          needs: [],
          team: [],
          partners: ["am"],
          capacity: "Not set",
          resources: [],
          exposed: true,
        };
        set((state) => ({ orgs: [...state.orgs, org] }));
        get().pushToast(`${org.name} is in the network.`);
        return id;
      },

      createFromDraft: (draft, inviteIds) => {
        const id = uid("prj");
        const project: Project = {
          id,
          name: draft.title.trim() || "Untitled project",
          status: "forming",
          ownerId: ME,
          orgId: "am",
          objective: draft.objective,
          summary: draft.summary,
          location: draft.location,
          skillIds: draft.skillIds,
          memberIds: [ME],
          timeline: [
            { id: uid("tl"), label: "Need named", when: "Today", done: true },
            { id: uid("tl"), label: "Team confirmed", when: "This week", done: false },
            { id: uid("tl"), label: "First working session", when: "Next", done: false },
          ],
          documents: [
            {
              id: uid("doc"),
              title: "Source question",
              kind: "Note",
              body: draft.objective,
            },
          ],
          outcome: "",
          sourceQuestion: draft.objective,
          updatedAt: Date.now(),
        };
        const workflow: Workflow = {
          id: uid("wf"),
          projectId: id,
          steps: [
            { id: uid("st"), title: "Frame the need", detail: "The question is now a project.", state: "done" },
            { id: uid("st"), title: "Confirm the team", detail: "Invite the people the skills point to.", state: "now" },
            {
              id: uid("st"),
              title: "Hold a first session",
              detail: "Leave with one decision and one owner.",
              state: "next",
            },
            { id: uid("st"), title: "Share an outcome", detail: "Say what changed.", state: "next" },
          ],
        };
        const tasks: Task[] = [
          {
            id: uid("task"),
            projectId: id,
            title: `Confirm who joins ${project.name}`,
            status: "today",
            ownerId: ME,
          },
          {
            id: uid("task"),
            projectId: id,
            title: "Agree the outcome of the first session",
            status: "week",
            ownerId: ME,
          },
        ];
        set((state) => ({
          projects: [project, ...state.projects],
          workflows: [...state.workflows, workflow],
          tasks: [...tasks, ...state.tasks],
          notices: [
            {
              id: uid("n"),
              text: `${project.name} is now a project.`,
              href: `/projects/${id}`,
              when: "Just now",
              read: false,
            },
            ...state.notices,
          ].slice(0, 30),
        }));
        for (const personId of inviteIds) {
          const person = get().people.find((item) => item.id === personId);
          const why = person
            ? `${person.skills.filter((skill) => draft.skillIds.includes(skill)).length} shared skills on ${project.name}`
            : "Invited from the need";
          get().connect(personId, id, why);
        }
        get().pushToast(`${project.name} is live.`);
        return id;
      },

      connect: (personId, projectId, why) => {
        const person = get().people.find((item) => item.id === personId);
        if (!person || person.id === ME) return;
        const first = person.name.split(" ")[0] ?? person.name;
        const existing = get().connections.find((item) => item.personId === personId);
        if (existing?.status === "connected") {
          if (projectId) {
            const project = get().projects.find((item) => item.id === projectId);
            const already = project?.memberIds.includes(personId);
            set((state) => ({
              projects: state.projects.map((item) =>
                item.id === projectId && !item.memberIds.includes(personId)
                  ? { ...item, memberIds: [...item.memberIds, personId], updatedAt: Date.now() }
                  : item,
              ),
              messages: already
                ? state.messages
                : [
                    ...state.messages,
                    {
                      id: uid("msg"),
                      threadId: `project:${projectId}`,
                      authorId: personId,
                      body: ACCEPT[personId] ?? "I'm in.",
                      atLabel: "Just now",
                    },
                  ],
            }));
            get().pushToast(already ? `${first} is already on this.` : `${first} joined the team.`);
          } else {
            get().pushToast(`${first} is already in your network.`);
          }
          return;
        }
        if (existing?.status === "pending") {
          get().pushToast(`Still waiting on ${first}.`);
          return;
        }
        const id = uid("con");
        const epoch = get().epoch;
        set((state) => ({
          connections: [...state.connections, { id, personId, projectId, status: "pending", why }],
          notices: [
            {
              id: uid("n"),
              text: `Connection request sent to ${person.name}.`,
              href: `/people/${personId}`,
              when: "Just now",
              read: false,
            },
            ...state.notices,
          ].slice(0, 30),
        }));
        get().pushToast(
          person.availability === "later" ? `${first} is booked ahead. The request stays open.` : `Request sent to ${first}.`,
        );
        if (person.availability === "later" || typeof window === "undefined") return;
        window.setTimeout(() => {
          if (get().epoch !== epoch) return;
          get().accept(id);
        }, 1200);
      },

      accept: (id) => {
        const connection = get().connections.find((item) => item.id === id);
        if (!connection || connection.status !== "pending") return;
        const person = get().people.find((item) => item.id === connection.personId);
        if (!person) return;
        const body = ACCEPT[person.id] ?? "I'm in. Tell me what the first week needs to prove.";
        const note = (threadId: string) => ({
          id: uid("msg"),
          threadId,
          authorId: person.id,
          body,
          atLabel: "Just now",
        });
        set((state) => ({
          connections: state.connections.map((item) => (item.id === id ? { ...item, status: "connected" } : item)),
          projects: connection.projectId
            ? state.projects.map((project) =>
                project.id === connection.projectId && !project.memberIds.includes(person.id)
                  ? { ...project, memberIds: [...project.memberIds, person.id], updatedAt: Date.now() }
                  : project,
              )
            : state.projects,
          messages: [
            ...state.messages,
            note(`dm:${person.id}`),
            ...(connection.projectId ? [note(`project:${connection.projectId}`)] : []),
          ],
          notices: [
            {
              id: uid("n"),
              text: `${person.name} accepted the connection.`,
              href: connection.projectId ? `/projects/${connection.projectId}` : `/people/${person.id}`,
              when: "Just now",
              read: false,
            },
            ...state.notices,
          ].slice(0, 30),
        }));
        get().pushToast(`${person.name.split(" ")[0]} accepted.`);
      },

      sendMessage: (threadId, body) => {
        const text = body.trim();
        if (!text) return;
        const epoch = get().epoch;
        set((state) => ({
          messages: [
            ...state.messages,
            { id: uid("msg"), threadId, authorId: ME, body: text, atLabel: "Just now" },
          ],
        }));
        if (typeof window === "undefined") return;
        window.setTimeout(() => {
          if (get().epoch !== epoch) return;
          let authorId: string | undefined;
          if (threadId.startsWith("dm:")) authorId = threadId.slice(3);
          if (threadId.startsWith("project:")) {
            const project = get().projects.find((item) => item.id === threadId.slice("project:".length));
            authorId = project?.memberIds.find((member) => member !== ME);
          }
          if (!authorId || authorId === ME) return;
          const reply = REPLIES[text.length % REPLIES.length] ?? REPLIES[0];
          set((state) => ({
            messages: [
              ...state.messages,
              { id: uid("msg"), threadId, authorId, body: reply, atLabel: "Just now" },
            ],
          }));
        }, 900);
      },

      setTaskStatus: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, status } : task)),
        })),

      addTask: (projectId, title, status = "today") => {
        const clean = title.trim();
        if (!clean) return;
        set((state) => ({
          tasks: [{ id: uid("task"), projectId, title: clean, status, ownerId: ME }, ...state.tasks],
        }));
      },

      advance: (projectId) => {
        const workflow = get().workflows.find((item) => item.projectId === projectId);
        if (!workflow) return;
        const index = workflow.steps.findIndex((step) => step.state === "now");
        if (index < 0) return;
        const steps = workflow.steps.map((step, stepIndex) => {
          if (stepIndex === index) return { ...step, state: "done" as const };
          if (stepIndex === index + 1) return { ...step, state: "now" as const };
          return step;
        });
        const finished = !steps.some((step) => step.state === "now" || step.state === "next");
        const current = steps.find((step) => step.state === "now");
        set((state) => ({
          workflows: state.workflows.map((item) => (item.projectId === projectId ? { ...item, steps } : item)),
          projects: state.projects.map((project) => {
            if (project.id !== projectId) return project;
            if (!finished) return { ...project, updatedAt: Date.now() };
            return {
              ...project,
              status: "done",
              outcome: project.outcome || "The work reached its last planned step.",
              updatedAt: Date.now(),
            };
          }),
        }));
        get().pushToast(finished ? "The workflow is complete." : `Now: ${current?.title ?? "next step"}.`);
      },

      makePlan: (projectId) => {
        const workflow = get().workflows.find((item) => item.projectId === projectId);
        const project = get().projects.find((item) => item.id === projectId);
        if (!workflow || !project) return;
        const existing = new Set(get().tasks.filter((task) => task.projectId === projectId).map((task) => task.title));
        const additions: Task[] = [];
        workflow.steps
          .filter((step) => step.state !== "done")
          .forEach((step, index) => {
            if (existing.has(step.title)) return;
            additions.push({
              id: uid("task"),
              projectId,
              title: step.title,
              status: index === 0 ? "today" : "week",
              ownerId: ME,
              note: step.detail,
            });
          });
        if (!additions.length) {
          get().pushToast("That plan is already on your list.");
          return;
        }
        set((state) => ({ tasks: [...additions, ...state.tasks] }));
        get().pushToast(`Plan added for ${project.name}.`);
      },

      takeOpportunity: (oppId) => {
        const opp = get().opportunities.find((item) => item.id === oppId);
        if (!opp) return;
        const project = opp.projectId ? get().projects.find((item) => item.id === opp.projectId) : undefined;
        const linked = get().connections.some((item) => item.personId === opp.leadId && item.status === "connected");
        if (project?.memberIds.includes(ME) && linked) {
          get().pushToast("You're already in this.");
          return;
        }
        get().connect(opp.leadId, opp.projectId, `Opportunity: ${opp.title}`);
        const title = `Follow up: ${opp.title}`;
        const home = opp.projectId ?? get().projects.find((item) => item.ownerId === ME)?.id;
        if (home && !get().tasks.some((task) => task.title === title)) {
          get().addTask(home, title, "today");
        }
      },

      later: (projectId, personId) =>
        set((state) => ({
          skipped: state.skipped.includes(`${projectId}:${personId}`)
            ? state.skipped
            : [...state.skipped, `${projectId}:${personId}`],
        })),

      toggleSave: (oppId) =>
        set((state) => {
          const current = state.savedOppIds ?? [];
          return {
            savedOppIds: current.includes(oppId) ? current.filter((id) => id !== oppId) : [...current, oppId],
          };
        }),

      readNotice: (id) =>
        set((state) => ({
          notices: state.notices.map((notice) => (notice.id === id ? { ...notice, read: true } : notice)),
        })),

      readAll: () =>
        set((state) => ({ notices: state.notices.map((notice) => ({ ...notice, read: true })) })),

      ask: (text) => {
        const clean = text.trim();
        const thought: Interpretation = interpret(clean, get(), get().skipped);
        const turn: AiTurn = { id: uid("m"), role: "am", ...thought };
        set((state) => ({
          ai: [...state.ai, { id: uid("m"), role: "user", body: clean }, turn],
        }));
        return turn;
      },

      resolve: (id) =>
        set((state) => ({ resolved: state.resolved.includes(id) ? state.resolved : [...state.resolved, id] })),

      reset: () => {
        const epoch = get().epoch + 1;
        const ui = get().ui;
        set({
          ...fresh(),
          skipped: [],
          savedOppIds: [],
          ai: [],
          resolved: [],
          toasts: [],
          epoch,
          ui,
        });
        get().pushToast("Starting point restored.");
      },
    }),
    {
      name: "action-matter-2",
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => (typeof window === "undefined" ? memoryStorage() : localStorage)),
      partialize: (state) => ({
        people: state.people,
        orgs: state.orgs,
        projects: state.projects,
        tasks: state.tasks,
        connections: state.connections,
        messages: state.messages,
        opportunities: state.opportunities,
        notices: state.notices,
        workflows: state.workflows,
        skipped: state.skipped,
        savedOppIds: state.savedOppIds,
        ai: state.ai,
        resolved: state.resolved,
      }),
    },
  ),
);

export function skillLabel(id: string) {
  return skillName(id);
}
