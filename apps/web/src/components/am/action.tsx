import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { firstName, myProjectTasks } from "@/lib/am/logic";
import { useAM } from "@/lib/am/store";
import { ME, type TaskStatus } from "@/lib/am/types";
import { Button, PageHeader, fieldClass } from "./ui";

const GROUPS: { status: TaskStatus; label: string; empty: string }[] = [
  { status: "today", label: "Today", empty: "Today is clear." },
  { status: "week", label: "This week", empty: "Nothing parked for the week." },
  { status: "waiting", label: "Waiting for", empty: "" },
  { status: "blocked", label: "Blocked", empty: "" },
  { status: "done", label: "Completed", empty: "" },
];

export function ActionPage() {
  const data = useAM();
  const tasks = myProjectTasks(data);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState(data.projects.find((project) => project.memberIds.includes(ME))?.id ?? "");
  const mine = data.projects.filter((project) => project.memberIds.includes(ME));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        kicker="Action"
        title="What the work is asking you to do."
        lede="Tasks come from projects, conversations, and the things you confirm."
      />
      <form
        className="mb-8 flex flex-col gap-2 rounded-xl border border-line bg-card p-4 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (!projectId) return;
          data.addTask(projectId, title, "today");
          setTitle("");
        }}
      >
        <label className="sr-only" htmlFor="action-title">
          Task
        </label>
        <input
          id="action-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add to today"
          className={fieldClass}
        />
        <label className="sr-only" htmlFor="action-project">
          Project
        </label>
        <select
          id="action-project"
          className={fieldClass}
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
        >
          {mine.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <Button type="submit">Add</Button>
      </form>
      <div className="space-y-8">
        {GROUPS.map((group) => {
          const list = tasks.filter((task) => task.status === group.status);
          if (!list.length && !group.empty) return null;
          return (
            <section key={group.status}>
              <h2 className="font-display text-2xl">{group.label}</h2>
              {list.length === 0 ? <p className="mt-2 text-sm text-muted">{group.empty}</p> : null}
              <ul className="mt-3 space-y-2">
                {list.map((task) => {
                  const project = data.projects.find((item) => item.id === task.projectId);
                  const owner = data.people.find((person) => person.id === task.ownerId);
                  return (
                    <li key={task.id} className="rounded-xl border border-line bg-card px-4 py-3">
                      <div className="flex items-start gap-3">
                        {group.status === "today" || group.status === "week" ? (
                          <button
                            type="button"
                            className="mt-1 size-5 shrink-0 rounded-full border border-brass"
                            aria-label={`Complete ${task.title}`}
                            onClick={() => data.setTaskStatus(task.id, "done")}
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <p className={group.status === "done" ? "text-muted line-through" : "font-medium"}>{task.title}</p>
                          <p className="text-sm text-muted">
                            {project ? (
                              <Link to="/projects/$id" params={{ id: project.id }} className="text-brass-ink">
                                {project.name}
                              </Link>
                            ) : null}
                            {owner && owner.id !== ME ? ` · ${firstName(owner.name)}` : ""}
                            {task.note ? ` · ${task.note}` : ""}
                          </p>
                          {group.status === "waiting" || group.status === "blocked" ? (
                            <button
                              type="button"
                              className="mt-2 text-sm font-medium text-brass-ink"
                              onClick={() => data.setTaskStatus(task.id, "today")}
                            >
                              Move to today
                            </button>
                          ) : null}
                          {group.status === "done" ? (
                            <button
                              type="button"
                              className="mt-2 text-sm text-muted"
                              onClick={() => data.setTaskStatus(task.id, "today")}
                            >
                              Reopen
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
