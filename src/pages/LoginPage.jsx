import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

async function parseResponseSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || `Request failed (${res.status})` };
  }
}

function LoginPage() {
  const [isSignup, setIsSignup] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
    const bodyData = isSignup ? { name, email, password } : { email, password };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await parseResponseSafe(res);

      if (!res.ok) {
        setError(data.message || "Request failed");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Can't connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "60px auto",
        padding: "24px",
        border: "1px solid #e5e5e5",
        borderRadius: "12px",
      }}
    >
      <h2 style={{ marginBottom: "16px" }}>
        {isSignup ? "Create Account" : "Sign In"}
      </h2>

      {error && (
        <p style={{ color: "#d93025", marginBottom: "12px", fontSize: "14px" }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {isSignup && (
          <div style={{ marginBottom: "12px" }}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>
        )}

        <div style={{ marginBottom: "12px" }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "20px",
            border: "none",
            backgroundColor: "#0f0f0f",
            color: "#fff",
            fontWeight: 500,
          }}
        >
          {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
        </button>
      </form>

      <p style={{ marginTop: "16px", fontSize: "14px", textAlign: "center" }}>
        {isSignup ? "Already have an account? " : "New here? "}
        <button
          type="button"
          onClick={() => {
            setIsSignup(!isSignup);
            setError("");
          }}
          style={{
            background: "none",
            border: "none",
            textDecoration: "underline",
            fontWeight: 500,
          }}
        >
          {isSignup ? "Sign In" : "Create Account"}
        </button>
      </p>
    </div>
  );
}

export default LoginPage;
