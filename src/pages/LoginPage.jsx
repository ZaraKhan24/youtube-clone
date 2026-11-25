import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
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

  const getInputStyle = (fieldName, hasRightPadding = false) => ({
    width: "100%",
    padding: hasRightPadding ? "12px 44px 12px 14px" : "12px 14px",
    fontSize: "14px",
    color: "#0f0f0f",
    backgroundColor: focusedField === fieldName ? "#ffffff" : "#f9f9f9",
    border:
      focusedField === fieldName ? "1.5px solid #065fd4" : "1px solid #d9d9d9",
    borderRadius: "10px",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.15s ease",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #fff1f1 0%, #f9f9f9 45%, #f2f2f2 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily:
          'Roboto, Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: "18px",
          padding: "32px 28px",
          boxShadow: "0 12px 32px rgba(15, 15, 15, 0.08)",
          boxSizing: "border-box",
        }}
      >
        {/* YouTube-style Brand Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "22px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "34px",
                height: "24px",
                backgroundColor: "#ff0000",
                borderRadius: "7px",
                boxShadow: "0 4px 10px rgba(255, 0, 0, 0.25)",
              }}
            >
              <span
                style={{
                  width: 0,
                  height: 0,
                  marginLeft: "2px",
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderLeft: "9px solid #ffffff",
                }}
              />
            </span>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "-0.5px",
                color: "#0f0f0f",
              }}
            >
              YouTube
            </span>
          </div>

          <Link
            to="/"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "#606060",
              textDecoration: "none",
            }}
          >
            ← Home
          </Link>
        </div>

        {/* Heading & Subtitle */}
        <h2
          style={{
            margin: "0 0 6px 0",
            fontSize: "22px",
            fontWeight: 700,
            color: "#0f0f0f",
          }}
        >
          {isSignup ? "Create your account" : "Sign in"}
        </h2>
        <p
          style={{
            margin: "0 0 20px 0",
            fontSize: "14px",
            color: "#606060",
            lineHeight: 1.45,
          }}
        >
          {isSignup
            ? "Join to upload videos, build playlists, and personalize your feed."
            : "to continue to YouTube and access your channel."}
        </p>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              padding: "10px 12px",
              borderRadius: "10px",
              marginBottom: "16px",
              fontSize: "13.5px",
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#272727",
                  marginBottom: "6px",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField("")}
                required
                style={getInputStyle("name")}
              />
            </div>
          )}

          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: 500,
                color: "#272727",
                marginBottom: "6px",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField("")}
              required
              style={getInputStyle("email")}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: 500,
                color: "#272727",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
                required
                style={getInputStyle("password", true)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#606060",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "4px 6px",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px 16px",
              borderRadius: "999px",
              border: "none",
              backgroundColor: loading ? "#cc0000" : "#ff0000",
              color: "#ffffff",
              fontSize: "14.5px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.8 : 1,
              boxShadow: "0 4px 12px rgba(255, 0, 0, 0.22)",
              transition: "background-color 0.15s ease, transform 0.1s ease",
            }}
          >
            {loading
              ? "Please wait..."
              : isSignup
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <div
          style={{
            marginTop: "22px",
            paddingTop: "18px",
            borderTop: "1px solid #efefef",
            fontSize: "14px",
            color: "#606060",
            textAlign: "center",
          }}
        >
          {isSignup ? "Already have an account? " : "New to YouTube? "}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#065fd4",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {isSignup ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
