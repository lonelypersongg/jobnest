
import { useState } from "react";
import api from "./api";

export default function ApplyForm({ jobId }) {
  const [cv, setCv] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitApplication(e) {
    e.preventDefault();
    setMessage("");

    if (!localStorage.getItem("token")) {
      setMessage("Please log in first.");
      return;
    }

    if (!cv) {
      setMessage("Please select your PDF CV.");
      return;
    }

    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("cv", cv);

    try {
      setLoading(true);
      const response = await api.post("/applications", formData);
      setMessage(response.data.message);
      setCv(null);
      e.target.reset();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Application failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submitApplication}>
      <label>
        Upload CV (PDF, maximum 5 MB)
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => setCv(e.target.files?.[0] || null)}
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Apply Now"}
      </button>

      {message && <p role="status">{message}</p>}
    </form>
  );
}