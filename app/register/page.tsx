    "use client";

    import { FormEvent, useState } from "react";
    import Link from "next/link";
    import { useRouter } from "next/navigation";

    export default function RegisterPage() {
    const router = useRouter();

    const [clinicName, setClinicName] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();


    setError("");

    if (
      !clinicName.trim() ||
      !fullName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clinicName: clinicName.trim(),
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error ||
            "Registration failed. Please check your information and try again."
        );
        return;
      }

      router.push(
        `/login?registered=1&email=${encodeURIComponent(
          email.trim().toLowerCase()
        )}`
      );
    } catch (err) {
      console.error("REGISTRATION ERROR:", err);
      setError(
        "Unable to complete registration. Please check your connection and try again."
      );
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
    maxWidth: "480px",
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
    Register Your Clinic </h1>


      <p
        style={{
          marginTop: "8px",
          marginBottom: 0,
          color: "#64748b",
          fontSize: "15px",
          lineHeight: 1.6,
        }}
      >
        Create your VisionFlow clinic account and start managing your
        operations.
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
          lineHeight: 1.5,
        }}
      >
        {error}
      </div>
    )}

    <form onSubmit={handleRegister}>
      <div style={{ marginBottom: "18px" }}>
        <label
          htmlFor="clinicName"
          style={{
            display: "block",
            marginBottom: "7px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Clinic Name
        </label>

        <input
          id="clinicName"
          type="text"
          placeholder="e.g. FORST Eye Clinic"
          value={clinicName}
          onChange={(event) => setClinicName(event.target.value)}
          disabled={loading}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            fontSize: "15px",
          }}
        />
      </div>

      <div style={{ marginBottom: "18px" }}>
        <label
          htmlFor="fullName"
          style={{
            display: "block",
            marginBottom: "7px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Your Full Name
        </label>

        <input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder="John Doe"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          disabled={loading}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            fontSize: "15px",
          }}
        />
      </div>

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
          Email Address
        </label>

        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@clinic.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={loading}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            fontSize: "15px",
          }}
        />
      </div>

      <div style={{ marginBottom: "18px" }}>
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
          autoComplete="new-password"
          placeholder="Minimum 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={loading}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            fontSize: "15px",
          }}
        />
      </div>

      <div style={{ marginBottom: "22px" }}>
        <label
          htmlFor="confirmPassword"
          style={{
            display: "block",
            marginBottom: "7px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Confirm Password
        </label>

        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={loading}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
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
        {loading ? "Creating Clinic..." : "Create Clinic Account"}
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
      <span>Already have an account? </span>

      <Link
        href="/login"
        style={{
          color: "#2563eb",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Sign in
      </Link>
    </div>
  </div>
</main>

);
}
