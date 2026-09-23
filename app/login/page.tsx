"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

async function handleLogin(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

setError("");

if (!email.trim() || !password) {
  setError("Please enter your email and password.");
  return;
}

try {
  setLoading(true);

  const result = await signIn("credentials", {
    email: email.trim().toLowerCase(),
    password,
    redirect: false,
  });

  if (!result?.ok) {
    setError("Invalid email or password.");
    return;
  }

  router.push("/");
  router.refresh();
} catch (err) {
  console.error("LOGIN ERROR:", err);
  setError("Something went wrong. Please try again.");
} finally {
  setLoading(false);
}


}

return (
<main
style={{
minHeight: "100vh",
display: "flex",
alignItems: "center",
justifyContent: "center",
padding: "24px",
background: "#f8fafc",
}}
>
<div
style={{
width: "100%",
maxWidth: "420px",
background: "#ffffff",
borderRadius: "16px",
padding: "32px",
boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
}}
>
<div style={{ marginBottom: "28px" }}>
<h1
style={{
margin: 0,
fontSize: "28px",
fontWeight: 700,
color: "#0f172a",
}}
>
Welcome to VisionFlow </h1>

```
      <p
        style={{
          marginTop: "8px",
          marginBottom: 0,
          color: "#64748b",
          fontSize: "15px",
        }}
      >
        Sign in to manage your eye clinic.
      </p>
    </div>

    {error && (
      <div
        style={{
          marginBottom: "18px",
          padding: "12px 14px",
          borderRadius: "8px",
          background: "#fef2f2",
          color: "#b91c1c",
          fontSize: "14px",
        }}
      >
        {error}
      </div>
    )}

    <form onSubmit={handleLogin}>
      <div style={{ marginBottom: "18px" }}>
        <label
          htmlFor="email"
          style={{
            display: "block",
            marginBottom: "7px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@clinic.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={loading}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            outline: "none",
            fontSize: "15px",
          }}
        />
      </div>

      <div style={{ marginBottom: "22px" }}>
        <label
          htmlFor="password"
          style={{
            display: "block",
            marginBottom: "7px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={loading}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            outline: "none",
            fontSize: "15px",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          border: "none",
          borderRadius: "8px",
          padding: "13px 16px",
          background: loading ? "#94a3b8" : "#2563eb",
          color: "#ffffff",
          fontSize: "15px",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>

    <div
      style={{
        marginTop: "24px",
        paddingTop: "20px",
        borderTop: "1px solid #e2e8f0",
        textAlign: "center",
        fontSize: "14px",
        color: "#64748b",
      }}
    >
      <span>Don't have a clinic account? </span>

      <Link
        href="/register"
        style={{
          color: "#2563eb",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Register your clinic
      </Link>
    </div>
  </div>
</main>

);
}
