import {
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Group,
  Card,
  ActionIcon,
  Select,
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { MoonStars, Sun, Trash, Edit } from "tabler-icons-react";

import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editTaskIndex, setEditTaskIndex] = useState(null);
  const [filter, setFilter] = useState(null);
  const [sortOption, setSortOption] = useState(null);

  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  const taskTitle = useRef("");
  const taskSummary = useRef("");
  const [taskState, setTaskState] = useState("Not done");

  function createTask() {
    const newTasks = [
      ...tasks,
      {
        title: taskTitle.current.value,
        summary: taskSummary.current.value,
        state: taskState,
      },
    ];
    setTasks(newTasks);
    saveTasks(newTasks);
    resetModalFields();
  }

  function updateTask() {
    const updatedTasks = tasks.map((task, index) =>
      index === editTaskIndex
        ? { ...task, title: taskTitle.current.value, summary: taskSummary.current.value, state: taskState }
        : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    resetModalFields();
    setEditTaskIndex(null);
    setOpened(false);
  }

  function deleteTask(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }

  function loadTasks() {
    const loadedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (loadedTasks) {
      setTasks(loadedTasks);
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function resetModalFields() {
    taskTitle.current.value = "";
    taskSummary.current.value = "";
    setTaskState("Not done");
  }

  function filterAndSortTasks() {
    let filteredTasks = tasks;
    if (filter) {
      filteredTasks = tasks.filter((task) => task.state === filter);
    }
    if (sortOption) {
      filteredTasks.sort((a, b) => (a.state === sortOption ? -1 : 1));
    }
    return filteredTasks;
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme, defaultRadius: "md" }}
        withGlobalStyles
        withNormalizeCSS
      >
        <div className="App">
          <Modal
            opened={opened}
            size={"md"}
            title={editTaskIndex === null ? "New Task" : "Edit Task"}
            withCloseButton={false}
            onClose={() => {
              setOpened(false);
              setEditTaskIndex(null);
              resetModalFields();
            }}
            centered
          >
            <TextInput
              mt={"md"}
              ref={taskTitle}
              placeholder={"Task Title"}
              required
              label={"Title"}
            />
            <TextInput
              ref={taskSummary}
              mt={"md"}
              placeholder={"Task Summary"}
              label={"Summary"}
            />
            <Select
              mt="md"
              label="State"
              placeholder="Select state"
              value={taskState}
              onChange={setTaskState}
              data={["Done", "Not done", "Doing right now"]}
            />
            <Group mt={"md"} position={"apart"}>
              <Button
                onClick={() => {
                  setOpened(false);
                  setEditTaskIndex(null);
                  resetModalFields();
                }}
                variant={"subtle"}
              >
                Cancel
              </Button>
              <Button
                onClick={editTaskIndex === null ? createTask : updateTask}
              >
                {editTaskIndex === null ? "Create Task" : "Update Task"}
              </Button>
            </Group>
          </Modal>
          <Container size={550} my={40}>
            <Group position={"apart"}>
              <Title
                sx={(theme) => ({
                  fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                  fontWeight: 900,
                })}
              >
                My Tasks
              </Title>
              <ActionIcon
                color={"blue"}
                onClick={() => toggleColorScheme()}
                size="lg"
              >
                {colorScheme === "dark" ? (
                  <Sun size={16} />
                ) : (
                  <MoonStars size={16} />
                )}
              </ActionIcon>
            </Group>
            <Group mt="md">
              <Button onClick={() => setSortOption("Done")}>Show "Done" first</Button>
              <Button onClick={() => setSortOption("Doing right now")}>
                Show "Doing" first
              </Button>
              <Button onClick={() => setSortOption("Not done")}>
                Show "Not done" first
              </Button>
            </Group>
            <Group mt="md">
              <Button onClick={() => setFilter("Done")}>Show only "Done"</Button>
              <Button onClick={() => setFilter("Doing right now")}>
                Show only "Doing"
              </Button>
              <Button onClick={() => setFilter("Not done")}>
                Show only "Not done"
              </Button>
              <Button onClick={() => setFilter(null)}>Clear Filter</Button>
            </Group>
            {filterAndSortTasks().length > 0 ? (
              filterAndSortTasks().map((task, index) => (
                <Card withBorder key={index} mt={"sm"}>
                  <Group position={"apart"}>
                    <Text weight={"bold"}>{task.title}</Text>
                    <Group>
                      <ActionIcon
                        onClick={() => {
                          setEditTaskIndex(index);
                          taskTitle.current.value = task.title;
                          taskSummary.current.value = task.summary;
                          setTaskState(task.state);
                          setOpened(true);
                        }}
                        color={"blue"}
                        variant={"transparent"}
                      >
                        <Edit />
                      </ActionIcon>
                      <ActionIcon
                        onClick={() => deleteTask(index)}
                        color={"red"}
                        variant={"transparent"}
                      >
                        <Trash />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <Text color={"dimmed"} size={"md"} mt={"sm"}>
                    {task.summary || "No summary was provided for this task"}
                  </Text>
                  <Text size="sm" mt="xs">
                    State: {task.state}
                  </Text>
                </Card>
              ))
            ) : (
              <Text size={"lg"} mt={"md"} color={"dimmed"}>
                You have no tasks
              </Text>
            )}
            <Button
              onClick={() => {
                setOpened(true);
              }}
              fullWidth
              mt={"md"}
            >
              New Task
            </Button>
          </Container>
        </div>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
