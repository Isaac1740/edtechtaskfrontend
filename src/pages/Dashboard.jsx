import React, { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [userRole, setUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  // Decode JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUserRole(decoded.role);
      setCurrentUserId(decoded.id);
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(res.data.tasks);
    } catch (error) {
      console.log("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const createTask = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/tasks",
        { title, description, dueDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowForm(false);
      setTitle("");
      setDescription("");
      setDueDate("");
      fetchTasks();
    } catch (err) {
      console.log("Error creating task:", err);
    }
  };

  const updateProgress = async (taskId, newStatus, isOwner) => {
    if (!isOwner) return alert("You can only edit your own tasks.");

    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/tasks/${taskId}`,
        { progress: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchTasks();
    } catch (err) {
      console.log("Error updating task:", err);
    }
  };

  const deleteTask = async (taskId, isOwner) => {
    if (!isOwner) return alert("You can only delete your own tasks.");

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchTasks();
    } catch (err) {
      console.log("Error deleting task:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      
      {/* Header */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-black transition shadow"
        >
          Logout
        </button>
      </div>

      <div className="max-w-5xl mx-auto mb-6">
        <p className="text-lg text-gray-700">
          <b>Logged in as:</b>{" "}
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md capitalize">
            {userRole}
          </span>
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Add Task */}
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow"
        >
          + Add Task
        </button>

        {/* Form */}
        {showForm && (
          <div className="bg-white p-6 shadow-lg rounded-lg mb-8">
            <h3 className="text-xl font-semibold mb-4">Create Task</h3>

            <input
              className="w-full p-3 border rounded-lg mb-3"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              className="w-full p-3 border rounded-lg mb-3"
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              type="date"
              className="w-full p-3 border rounded-lg mb-4"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <button
              onClick={createTask}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow"
            >
              Create Task
            </button>
          </div>
        )}

        {/* Task Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {tasks.map((t) => {
            const isOwner = String(t?.userId?._id) === String(currentUserId);
            const studentEmail = t.userId?.email;

            return (
              <div
                key={t._id}
                className="bg-white shadow-lg rounded-lg p-6 relative border border-gray-200"
              >
                {/* Badge */}
                {userRole === "teacher" && (
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-md text-sm font-bold text-white ${
                      isOwner ? "bg-blue-600" : "bg-gray-700"
                    }`}
                  >
                    {isOwner ? "Teacher Task" : `by ${studentEmail}`}
                  </div>
                )}

                {userRole === "teacher" && !isOwner && (
                  <p className="text-sm text-gray-500 mb-2">
                    <b>Student:</b> {studentEmail}
                  </p>
                )}

                <h3 className="text-xl font-semibold text-gray-900">
                  {t.title}
                </h3>

                <p className="text-gray-700 mb-3">{t.description}</p>

                {/* Status Tag */}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4
                    ${
                      t.progress === "completed"
                        ? "bg-green-100 text-green-700"
                        : t.progress === "in-progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-700"
                    }
                  `}
                >
                  {t.progress}
                </span>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  <select
                    value={t.progress}
                    onChange={(e) =>
                      updateProgress(t._id, e.target.value, isOwner)
                    }
                    disabled={!isOwner}
                    className="p-2 border rounded-lg bg-white shadow-sm disabled:opacity-50"
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button
                    onClick={() => deleteTask(t._id, isOwner)}
                    disabled={!isOwner}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
