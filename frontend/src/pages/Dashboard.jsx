import { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");

  const token = localStorage.getItem("token");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:5000/api/tasks", config);
    setTasks(res.data.tasks);
  };

  const createTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Task title is required");
      return;
    }

    await axios.post(
      "http://localhost:5000/api/tasks",
      { title, description, priority },
      config
    );

    setTitle("");
    setDescription("");
    setPriority("Medium");
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await axios.delete(`http://localhost:5000/api/tasks/${id}`, config);
    fetchTasks();
  };

  const toggleTask = async (id) => {
    await axios.patch(
      `http://localhost:5000/api/tasks/${id}/toggle`,
      {},
      config
    );
    fetchTasks();
  };

  const startEdit = (task) => {
    setEditId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTitle("");
    setEditDescription("");
    setEditPriority("Medium");
  };

  const updateTask = async (id) => {
    if (!editTitle.trim()) {
      alert("Task title is required");
      return;
    }

    await axios.put(
      `http://localhost:5000/api/tasks/${id}`,
      {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
      },
      config
    );

    cancelEdit();
    fetchTasks();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
    } else {
      fetchTasks();
    }
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const pendingTasks = tasks.filter((task) => task.status !== "Completed").length;

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Completed" && task.status === "Completed") ||
      (filter === "Pending" && task.status !== "Completed");

    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="container">
      <h1>Dashboard Page</h1>
      <h3>User Logged In Successfully ✅</h3>

      <button onClick={handleLogout} className="logout">
        Logout
      </button>

      <h2>Task Statistics</h2>

      <div className="stats">
        <div className="stat-card">Total: {totalTasks}</div>
        <div className="stat-card">Completed: {completedTasks}</div>
        <div className="stat-card">Pending: {pendingTasks}</div>
      </div>

      <form onSubmit={createTask} className="form-row">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <button type="submit">Add Task</button>
      </form>

      <h2>Your Tasks</h2>

      <div>
        <button onClick={() => setFilter("All")}>All</button>
        <button onClick={() => setFilter("Pending")}>Pending</button>
        <button onClick={() => setFilter("Completed")}>Completed</button>
      </div>

      <br />

      <input
        type="text"
        placeholder="Search task"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredTasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        filteredTasks.map((task) => (
          <div key={task._id}>
            {editId === task._id ? (
              <div className="edit-box">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />

                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />

                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>

                <button onClick={() => updateTask(task._id)}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              <div className="task-card">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p>Status: {task.status}</p>
                <p>Priority: {task.priority}</p>

                <button onClick={() => toggleTask(task._id)}>
                  {task.status === "Completed" ? "Mark Pending" : "Mark Complete"}
                </button>

                <button onClick={() => startEdit(task)}>Edit</button>
                <button onClick={() => deleteTask(task._id)}>Delete</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;