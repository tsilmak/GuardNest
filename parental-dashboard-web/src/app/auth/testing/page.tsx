"use client";

import { useState } from "react";
import { authFetch } from "@/lib/auth-fetch";

const GO_API_BASE = process.env.NEXT_PUBLIC_GO_API_URL;

export default function AuthTestingPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callVerifyNoAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${GO_API_BASE}/api/verify`, { method: "GET" });
      const data = await res.json();
      setResult({ status: res.status, data });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const callVerifyWithCookie = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/verify");
      const data = await res.json();
      setResult({ status: res.status, data });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const callSecureWithCookie = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/secure");
      const data = await res.json();
      setResult({ status: res.status, data });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const doLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      let data: unknown = null;
      try {
        data = await res.json();
      } catch {}
      setResult({ status: res.status, data });
      if (!res.ok) {
        throw new Error("Login failed");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const doRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      setResult({ status: res.status, data });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const doLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      setResult({ status: res.status, data });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const doSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      let data: unknown = null;
      try {
        data = await res.json();
      } catch {}
      setResult({ status: res.status, data });
      if (!res.ok) {
        const errorMessage = (data as any)?.error || "Registration failed";
        throw new Error(errorMessage);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
        Auth Testing (Session Cookies + Registration)
      </h1>
      <p style={{ marginBottom: 16 }}>Go API base: {GO_API_BASE}</p>

      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
        />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
        />
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={doLogin} disabled={loading}>
            Login (Next.js)
          </button>
          <button onClick={doSignup} disabled={loading}>
            Register (Next.js)
          </button>
          <button onClick={doRefresh} disabled={loading}>
            Refresh (Next.js)
          </button>
          <button onClick={doLogout} disabled={loading}>
            Logout (Next.js)
          </button>
        </div>
      </div>

      <div
        style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}
      >
        <button onClick={callVerifyNoAuth} disabled={loading}>
          Go Verify (no cookie)
        </button>
        <button onClick={callVerifyWithCookie} disabled={loading}>
          Go Verify (auth cookie)
        </button>
        <button onClick={callSecureWithCookie} disabled={loading}>
          Go Secure (auth cookie)
        </button>
      </div>

      {loading ? <p>Loading...</p> : null}
      {error ? <p style={{ color: "#dc2626" }}>{error}</p> : null}
      {result ? (
        <pre
          style={{
            marginTop: 12,
            background: "#1118270d",
            padding: 12,
            borderRadius: 8,
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
