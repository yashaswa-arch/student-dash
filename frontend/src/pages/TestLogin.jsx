import React from "react";

/**
 * TestLogin Component
 * Dev-only page for quickly obtaining a test user token
 * Only use in development environment
 */
export default function TestLogin() {
  async function getToken() {
    try {
      const res = await fetch("http://localhost:5000/api/dev-auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "test-user", role: "user" })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        alert("Token saved to localStorage: token");
      } else {
        alert("Failed to get token");
      }
    } catch (e) {
      console.error(e);
      alert("Error");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h3>Dev Test Login</h3>
      <button onClick={getToken}>Sign in as test user</button>
      <p>Use this only in dev. After sign-in, reload the video page to fetch protected metadata.</p>
    </div>
  );
}

