import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

const API_URL = "http://localhost:3000";

// ── Helper: build fetch options with auth header ──────────────
function authHeaders(token, extra = {}) {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...extra,
  };
}

// ── Auth Form (Login / Register) ──────────────────────────────
function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = mode === "login" ? "/auth/login" : "/auth/register";

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        // Show validation errors if present
        if (result.errors) {
          const msgs = Object.values(result.errors).join(" ");
          throw new Error(msgs);
        }
        throw new Error(result.message || "Authentication failed.");
      }

      if (mode === "register") {
        // After register, switch to login automatically
        setMode("login");
        setPassword("");
        setError(null);
        return;
      }

      // Login success — pass token + user up
      onAuth(result.token, result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="contact-form-wrap" style={{ maxWidth: 400, margin: "0 auto" }}>
      <p className="page-eyebrow" style={{ marginBottom: 8 }}>
        {mode === "login" ? "Welcome back" : "Create account"}
      </p>
      <h3 className="project-title" style={{ marginBottom: 20 }}>
        {mode === "login" ? "Login" : "Register"}
      </h3>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-input"
            placeholder="At least 3 characters"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && <ErrorMessage message={error} />}

        {mode === "register" && (
          <p style={{ fontSize: 12, color: "#6B7280" }}>
            ✅ After registering, log in with your new credentials.
          </p>
        )}

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button type="submit" className="form-submit" disabled={loading}>
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Registering..."
              : mode === "login"
              ? "Login"
              : "Register"}
          </button>

          <button
            type="button"
            className="form-submit form-submit--outline"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
            }}
            disabled={loading}
          >
            {mode === "login" ? "Create account" : "Back to login"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Task List ──────────────────────────────────────────────────
function TaskList({ tasks, onEdit, onDelete, onToggle, actionLoading }) {
  return (
    <div className="projects-grid">
      {tasks.map((task) => (
        <div key={task._id} className="project-card">
          <div className="project-card-top">
            <div className="repo-header">
              <span className="project-category">
                {task.completed ? "Completed" : "Pending"}
              </span>
            </div>
            <h3 className="project-title">{task.title}</h3>
            <p className="project-desc">
              {task.description || "No description provided."}
            </p>
          </div>

          <div className="project-card-bottom">
            <div className="repo-stats">
              <span className="repo-stat">
                {task.completed ? "✅ Completed" : "⏳ Pending"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                className="filter-btn"
                onClick={() => onToggle(task)}
                disabled={actionLoading}
              >
                {task.completed ? "Mark Pending" : "Complete"}
              </button>
              <button
                className="filter-btn"
                onClick={() => onEdit(task)}
                disabled={actionLoading}
              >
                Edit
              </button>
              <button
                className="filter-btn"
                onClick={() => onDelete(task._id)}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Projects Page ─────────────────────────────────────────
function Projects() {
  // ── Auth state — token persisted in localStorage ──
  const [token, setToken] = useState(() => localStorage.getItem("jwt_token") || null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("jwt_user")) || null;
    } catch {
      return null;
    }
  });

  // ── Task state ──
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // ── Form state ──
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  // ── Called by AuthForm on successful login ──
  function handleAuth(newToken, user) {
    localStorage.setItem("jwt_token", newToken);
    localStorage.setItem("jwt_user", JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
  }

  // ── Logout ──
  function handleLogout() {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("jwt_user");
    setToken(null);
    setCurrentUser(null);
    setTasks([]);
  }

  // ── GET /tasks — runs whenever token changes ──
  const fetchTasks = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API_URL}/tasks`,
        authHeaders(token, { method: "GET" })
      );

      // 401 means token expired — force logout
      if (res.status === 401) {
        handleLogout();
        return;
      }

      if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.status}`);

      const result = await res.json();
      setTasks(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  // ── POST / PUT task ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setActionError("Task title is required.");
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);

      const isEditing = Boolean(editingTask);
      const url = isEditing
        ? `${API_URL}/tasks/${editingTask._id}`
        : `${API_URL}/tasks`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(
        url,
        authHeaders(token, {
          method,
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            completed: isEditing ? editingTask.completed : false,
          }),
        })
      );

      const result = await res.json();

      if (res.status === 401) { handleLogout(); return; }

      if (!res.ok) {
        // Surface server-side validation errors
        if (result.errors) {
          throw new Error(Object.values(result.errors).join(" "));
        }
        throw new Error(result.message || "Failed to save task.");
      }

      if (isEditing) {
        setTasks((cur) =>
          cur.map((t) => (t._id === result.data._id ? result.data : t))
        );
      } else {
        setTasks((cur) => [result.data, ...cur]);
      }

      setTitle("");
      setDescription("");
      setEditingTask(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── DELETE ──
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      setActionLoading(true);
      setActionError(null);

      const res = await fetch(
        `${API_URL}/tasks/${id}`,
        authHeaders(token, { method: "DELETE" })
      );

      if (res.status === 401) { handleLogout(); return; }

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete task.");

      setTasks((cur) => cur.filter((t) => t._id !== id));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Toggle completed ──
  const handleToggle = async (task) => {
    try {
      setActionLoading(true);
      setActionError(null);

      const res = await fetch(
        `${API_URL}/tasks/${task._id}`,
        authHeaders(token, {
          method: "PUT",
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            completed: !task.completed,
          }),
        })
      );

      if (res.status === 401) { handleLogout(); return; }

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update task.");

      setTasks((cur) =>
        cur.map((t) => (t._id === result.data._id ? result.data : t))
      );
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setActionError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setActionError(null);
  };

  // ── If not logged in, show auth form ──
  if (!token) {
    return (
      <div className="page">
        <div className="page-header">
          <p className="page-eyebrow">MongoDB Task Manager</p>
          <h2 className="page-title">Tasks</h2>
          <p className="page-subtitle">Log in to manage your tasks.</p>
        </div>
        <AuthForm onAuth={handleAuth} />
      </div>
    );
  }

  // ── Logged-in view ──
  return (
    <div className="page">
      <div className="page-header">
        <p className="page-eyebrow">MongoDB Task Manager</p>
        <h2 className="page-title">Tasks</h2>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p className="page-subtitle">
            {loading
              ? "Loading tasks..."
              : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} — logged in as `}
            {!loading && <strong>{currentUser?.username}</strong>}
          </p>
          <button className="form-submit form-submit--outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Create / Edit Form */}
      <div className="contact-form-wrap">
        <h3 className="project-title" style={{ marginBottom: 16 }}>
          {editingTask ? "Edit Task" : "Create New Task"}
        </h3>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              disabled={actionLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              disabled={actionLoading}
            />
          </div>

          {actionError && <ErrorMessage message={actionError} />}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="form-submit" disabled={actionLoading}>
              {actionLoading
                ? editingTask ? "Updating..." : "Creating..."
                : editingTask ? "Update Task" : "Create Task"}
            </button>

            {editingTask && (
              <button
                type="button"
                className="form-submit form-submit--outline"
                onClick={handleCancelEdit}
                disabled={actionLoading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {loading && <Spinner />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        tasks.length === 0 ? (
          <div className="no-results">No tasks found. Create your first task above.</div>
        ) : (
          <TaskList
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
            actionLoading={actionLoading}
          />
        )
      )}
    </div>
  );
}

export default Projects;
