import { useEffect, useState } from "react";
import api from "./api";
import AuthForm from "./AuthForm";
import "./App.css";
import ApplyForm from "./Applyform";
function App() {
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [salary, setSalary] = useState("Any salary");
  const [company, setCompany] = useState("All companies");
  const [selectedJob, setSelectedJob] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  async function loadJobs() {
    setLoadingJobs(true);
    setJobsError("");

    try {
      const response = await api.get("/jobs");
      setJobs(response.data);
    } catch (error) {
      console.error("Could not load jobs:", error);
      setJobsError(
        "Could not load jobs. Make sure your backend and MongoDB are running."
      );
    } finally {
      setLoadingJobs(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const title = job.title || job.role || "";
    const companyName = job.company || "";
    const location = job.location || "";
    const salaryText = String(job.salary ?? "");
    const salaryNumber = Number(salaryText.replace(/[^0-9.]/g, ""));

    const matchesKeyword =
      `${title} ${companyName} ${location}`
        .toLowerCase()
        .includes(keyword.toLowerCase());

    const matchesSalary =
      salary === "Any salary" ||
      (salaryNumber > 0 && salaryNumber >= Number(salary));

    const matchesCompany =
      company === "All companies" || companyName === company;

    return matchesKeyword && matchesSalary && matchesCompany;
  });

  const companies = [...new Set(jobs.map((job) => job.company).filter(Boolean))];

  function handleAuthSuccess(user) {
    setCurrentUser(user);
    setAuthMode(null);
    loadJobs();
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    alert("You have logged out.");
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="logo" href="#">
          Job<span>Nest</span>
        </a>

        <nav>
          <a href="#jobs">Find Jobs</a>
          <a href="#categories">Categories</a>
          <a href="#companies">Companies</a>
        </nav>

        <div className="nav-buttons">
          {currentUser ? (
            <>
              <span>Hi, {currentUser.name}</span>
              <button className="login-button" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                className="login-button"
                onClick={() => setAuthMode("login")}
              >
                Log in
              </button>
              <button
                className="signup-button"
                onClick={() => setAuthMode("register")}
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">YOUR NEXT OPPORTUNITY STARTS HERE</p>

          <h1>
            Find a job that
            <br />
            <span>fits your future.</span>
          </h1>

          <p className="hero-description">
            Discover opportunities from companies and find work that matches
            your skills, goals, and salary expectations.
          </p>

          <form
            className="search-form"
            onSubmit={(event) => {
              event.preventDefault();
              document
                .getElementById("jobs")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <input
              aria-label="Search jobs"
              placeholder="Job title, company, or location"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />

            <select
              aria-label="Minimum salary"
              value={salary}
              onChange={(event) => setSalary(event.target.value)}
            >
              <option>Any salary</option>
              <option value="300">From $300/month</option>
              <option value="500">From $500/month</option>
              <option value="800">From $800/month</option>
              <option value="1000">From $1,000/month</option>
            </select>

            <select
              aria-label="Company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
            >
              <option>All companies</option>
              {companies.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <button type="submit" className="search-button">
              Search jobs
            </button>
          </form>

          <p className="hero-note">
            Start exploring opportunities in Cambodia and beyond.
          </p>
        </section>

        <section className="categories section" id="categories">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EXPLORE OPPORTUNITIES</p>
              <h2>Browse by category</h2>
            </div>
          </div>

          <div className="category-grid">
            {[
              ["💻", "Technology", "Developers and IT"],
              ["🎨", "Design", "Creative opportunities"],
              ["📊", "Business", "Business and finance"],
              ["🌍", "Remote", "Work from anywhere"],
            ].map(([icon, name, description]) => (
              <button
                className="category-card"
                key={name}
                onClick={() => {
                  setKeyword(name === "Remote" ? "Remote" : name);
                  document
                    .getElementById("jobs")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span className="category-icon">{icon}</span>
                <strong>{name}</strong>
                <span>{description}</span>
                <span className="category-arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        <section className="jobs section" id="jobs">
          <div className="section-heading">
            <div>
              <p className="eyebrow">FIND YOUR NEXT ROLE</p>
              <h2>Featured jobs</h2>
              <p>Explore opportunities that could be right for you.</p>
            </div>
            <span className="job-count">
              {loadingJobs ? "Loading..." : `${filteredJobs.length} jobs found`}
            </span>
          </div>

          {loadingJobs && <p>Loading jobs from JobNest...</p>}

          {jobsError && (
            <div className="empty-state">
              <p>{jobsError}</p>
              <button className="signup-button" onClick={loadJobs}>
                Try again
              </button>
            </div>
          )}

          {!loadingJobs && !jobsError && (
            <div className="job-grid">
              {filteredJobs.map((job) => {
                const title = job.title || job.role || "Untitled job";
                const salaryText = String(job.salary ?? "Negotiable");

                return (
                  <article className="job-card" key={job._id || job.id}>
                    <div className="job-card-top">
                      <div className="company-logo">
                        {(job.company || "?").slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <strong>{job.company}</strong>
                        <p>Job listing</p>
                      </div>
                    </div>

                    <h3>{title}</h3>

                    <div className="job-tags">
                      <span>{job.type || "Full-time"}</span>
                      <span>{job.location}</span>
                    </div>

                    <div className="job-card-bottom">
                      <div>
                        <strong>{salaryText}</strong>
                        <p>Salary / month</p>
                      </div>

                      <button
                        className="apply-button"
                        onClick={() => setSelectedJob(job)}
                      >
                        View job ↗
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loadingJobs && !jobsError && filteredJobs.length === 0 && (
            <div className="empty-state">
              <h3>No matching jobs found</h3>
              <p>Try changing your search or salary filters.</p>
              <button
                className="signup-button"
                onClick={() => {
                  setKeyword("");
                  setSalary("Any salary");
                  setCompany("All companies");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        <section className="employer-banner" id="companies">
          <div>
            <p className="eyebrow">FOR EMPLOYERS</p>
            <h2>Looking for the right person to join your team?</h2>
            <p>Register and create your employer account to get started.</p>
          </div>

          <button
            className="signup-button"
            onClick={() => setAuthMode("register")}
          >
            Register company →
          </button>
        </section>
      </main>

      <footer className="footer">
        <a className="logo" href="#">
          Job<span>Nest</span>
        </a>
        <p>Connecting people with opportunities.</p>
        <p>© 2026 JobNest</p>
      </footer>

      {selectedJob && (
        <div className="modal-backdrop" onClick={() => setSelectedJob(null)}>
          <ApplyForm jobId={selectedJob._id} />
          <section
            className="application-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedJob(null)}
              aria-label="Close"
            >
              ×
            </button>

            <p className="eyebrow">JOB DETAILS</p>
            <h2 id="application-title">
              {selectedJob.title || selectedJob.role}
            </h2>
            <p>{selectedJob.company}</p>
            <p>{selectedJob.location}</p>
            <strong>{String(selectedJob.salary || "Negotiable")}</strong>
            <p>{selectedJob.description}</p>

            {selectedJob.requirements?.length > 0 && (
              <>
                <h3>Requirements</h3>
                <ul>
                  {selectedJob.requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </>
            )}

            <p className="modal-note">
              Job details are loaded from the JobNest database. Job application
              submission and CV uploads have not been implemented yet.
            </p>
          </section>
        </div>
      )}
 {authMode && (setAuthMode === "login" || setAuthMode === "register") && (
        <div className="modal-backdrop" onClick={() => setAuthMode(null)}>
          <section
            className="application-modal auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setAuthMode(null)}
              aria-label="Close"
            >
              ×
            </button>

            <h2 id="auth-title">
              {authMode === "register" ? "Create your account" : "Welcome back"}
            </h2>

            <AuthForm
              mode={authMode}
              onSuccess={handleAuthSuccess}
            />

            <p>
              {authMode === "register"
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button
                type="button"
                className="login-button"
                onClick={() =>
                  setAuthMode(authMode === "register" ? "login" : "register")
                }
              >
                {authMode === "register" ? "Log in" : "Sign up"}
              </button>
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;