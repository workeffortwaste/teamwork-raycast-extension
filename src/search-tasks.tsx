import {
  Action,
  ActionPanel,
  Color,
  Icon,
  Keyboard,
  List,
  Toast,
  getPreferenceValues,
  open,
  showToast,
} from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useEffect, useState } from "react";
import { addRecentTask, getRecentTasks, removeRecentTask, updateRecentTask } from "./recent";
import { fetchTask, searchTasks, startTimer, taskUrl } from "./teamwork";
import type { TeamworkTask } from "./types";

export default function Command() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"active" | "completed">("active");
  const [recents, setRecents] = useState<TeamworkTask[]>([]);
  useEffect(() => {
    getRecentTasks().then(setRecents);
  }, []);

  const {
    data = [],
    isLoading,
    revalidate,
  } = usePromise(searchTasks, [query, filter === "completed"]);

  async function remember(task: TeamworkTask) {
    await addRecentTask(task);
    setRecents(await getRecentTasks());
  }

  async function beginTimer(task: TeamworkTask) {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Starting Teamwork timer…",
    });
    try {
      await startTimer(task);
      await remember(task);

      toast.style = Toast.Style.Success;
      toast.title = "Timer started";
      toast.message = task.name;

      await revalidate();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Could not start timer";
      toast.message = error instanceof Error ? error.message : String(error);
    }
  }

  async function refreshRecent(task: TeamworkTask) {
    const toast = await showToast({ style: Toast.Style.Animated, title: "Refreshing task…" });
    try {
      const fresh = await fetchTask(task.id);
      if (fresh) {
        await updateRecentTask(fresh);
        setRecents(await getRecentTasks());
        toast.style = Toast.Style.Success;
        toast.title = "Task refreshed";
      } else {
        toast.style = Toast.Style.Failure;
        toast.title = "Task not found";
      }
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Could not refresh task";
      toast.message = error instanceof Error ? error.message : String(error);
    }
  }

  async function removeRecent(task: TeamworkTask) {
    await removeRecentTask(task.id);
    setRecents(await getRecentTasks());
  }

  const recentLimit = Math.max(1, parseInt(getPreferenceValues<{ recentLimit: string }>().recentLimit, 10) || 5);
  const showRecents =
    query.length === 0 && filter === "active" && recents.length > 0;
  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search tasks assigned to me…"
      onSearchTextChange={setQuery}
      throttle
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter Tasks"
          value={filter}
          onChange={(value) => setFilter(value as "active" | "completed")}
        >
          <List.Dropdown.Item
            title="Active"
            value="active"
            icon={Icon.Circle}
          />
          <List.Dropdown.Item
            title="Completed"
            value="completed"
            icon={Icon.CheckCircle}
          />
        </List.Dropdown>
      }
    >
      {showRecents ? (
        <List.Section title="Recent">
          {recents.slice(0, recentLimit).map((task) => (
            <TaskItem
              key={`recent-${task.id}`}
              task={task}
              onOpen={remember}
              onStart={beginTimer}
              onRefresh={refreshRecent}
              onRemove={removeRecent}
            />
          ))}
        </List.Section>
      ) : null}
      <List.Section
        title={filter === "completed" ? "Completed" : "Assigned to Me"}
      >
        {data.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onOpen={remember}
            onStart={beginTimer}
          />
        ))}
      </List.Section>
    </List>
  );
}

function TaskItem({
  task,
  onOpen,
  onStart,
  onRefresh,
  onRemove,
}: {
  task: TeamworkTask;
  onOpen: (task: TeamworkTask) => void;
  onStart: (task: TeamworkTask) => void;
  onRefresh?: (task: TeamworkTask) => void;
  onRemove?: (task: TeamworkTask) => void;
}) {
  const accessories: List.Item.Accessory[] = [];
  if (task.dueDate)
    accessories.push({
      date: new Date(task.dueDate),
      tooltip: `Due ${task.dueDate}`,
    });

  const isCompleted = task.status === "completed";
  const icon = isCompleted
    ? { source: Icon.CheckCircle, tintColor: Color.Green }
    : { source: Icon.Circle, tintColor: Color.SecondaryText };

  return (
    <List.Item
      icon={icon}
      title={task.name}
      subtitle={task.tasklistName}
      accessories={accessories}
      actions={
        <ActionPanel>
          <Action
            title="Start Timer"
            icon={Icon.Stopwatch}
            onAction={() => onStart(task)}
          />
          <Action
            title="Open in Teamwork"
            icon={Icon.Globe}
            onAction={async () => {
              await onOpen(task);
              await open(taskUrl(task.id));
            }}
          />
          <Action.CopyToClipboard
            title="Copy Task Link"
            content={taskUrl(task.id)}
          />
          <Action.CopyToClipboard
            title="Copy Task Name"
            content={task.name}
            shortcut={Keyboard.Shortcut.Common.Copy}
          />
          {onRefresh ? (
            <Action
              title="Refresh Task"
              icon={Icon.ArrowClockwise}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
              onAction={() => onRefresh(task)}
            />
          ) : null}
          {onRemove ? (
            <Action
              title="Remove from Recents"
              icon={Icon.Trash}
              style={Action.Style.Destructive}
              shortcut={{ modifiers: ["ctrl"], key: "x" }}
              onAction={() => onRemove(task)}
            />
          ) : null}
        </ActionPanel>
      }
    />
  );
}
