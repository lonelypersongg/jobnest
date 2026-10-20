
import { useState } from "react";
import api from "./api";

export default function AuthForm({ mode = "login", onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Job Seeker");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        mode === "register" ? "/auth/register" : "/auth/login";

      const payload =
        mode === "register"
          ? { name, email, password, role }
          : { email, password };

      const { data } = await api.post(endpoint, payload);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onSuccess?.(data.user);
      alert(`${data.message}!`);
    } catch (err) {
      setError(err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {mode === "register" && (
        <>
          <input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Job Seeker</option>
            <option>Employer</option>
          </select>
        </>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password (minimum 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={6}
        required
      />

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Please wait..." : mode === "register" ? "Sign Up" : "Login"}
      </button>
    </form>
  );
}