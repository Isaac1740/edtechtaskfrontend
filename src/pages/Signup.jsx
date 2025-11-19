import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [teacherId, setTeacherId] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState("");

  // Fetch teachers only if role = student
  useEffect(() => {
    if (role === "student") {
      api
        .get("/teachers")
        .then((res) => {
          setTeachers(res.data.teachers);
        })
        .catch((err) => {
          console.log("Error fetching teachers:", err);
        });
    }
  }, [role]);

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const body = { email, password, role };

      if (role === "student") {
        body.teacherId = teacherId;
      }

      const res = await api.post("/auth/signup", body);

      if (res.data.success) {
        navigate("/");
      }
    } catch (err) {
      setError("Signup failed. Email may already be in use.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Signup</h2>

        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSignup} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password (min 6 chars)"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          {role === "student" && (
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.email}
                </option>
              ))}
            </select>
          )}

          <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition">
            Signup
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <a href="/" className="text-blue-600 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
