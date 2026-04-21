"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import AuthHeading from "@/components/auth/AuthHeading";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import AuthDivider from "@/components/auth/AuthDivider";
import { User } from "@/constants/types";

// ── Inner form — uses useSearchParams so must be inside Suspense ──
function SignInForm() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const AUTO_REDIRECT = false; // ← Toggle this for testing
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error"); // NextAuth appends ?error=CredentialsSignin on failure

  // Redirect if already authenticated
  useEffect(() => {
    if (!AUTO_REDIRECT) return; // ← comment this line out for production
    if (status === "authenticated" && session?.user) {
      const user = session.user as User;
      if (user.parent_org_id) {
        setRedirecting(true);
        router.replace(`/${user.parent_org_id}/dashboard`);
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setIsLoading(false);
        return;
      }

      // Sign-in succeeded — redirect directly
      setRedirecting(true);
      const user = session?.user as User;
      if (user?.parent_org_id) {
        router.replace(`/${user.parent_org_id}/dashboard`);
      } else {
        router.refresh(); // fallback if session hasn't updated yet
      }

      // The useEffect watching session will handle the redirect once the session updates
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const displayError = error || (urlError === "CredentialsSignin" ? "Invalid email or password." : urlError);

  if (redirecting || status === "loading") {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 40,
      }}>
        <div style={{
          width: 24,
          height: 24,
          border: "2px solid var(--color-border-subtle)",
          borderTopColor: "var(--color-text)",
          borderRadius: "50%",
          animation: "spin 0.6s linear infinite",
        }} />
        <p style={{
          fontSize: 13,
          color: "var(--color-text-muted)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          Redirecting…
        </p>
      </div>
    );
  }

  return (
    <>
      <AuthHeading
        path="auth.signin"
        title="Sign in to Insiight"
        subtitle="Analytics and audience intelligence for out-of-home media."
      />

      {/* Error message */}
      {displayError && (
        <div style={{
          marginBottom: 16,
          padding: "8px 12px",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "var(--brand-radius-md)",
          fontSize: 12,
          color: "#dc2626",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          {displayError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <AuthInput
          label="email address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="user@organisation.com"
          required
        />
        <AuthInput
          label="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••••"
          required
        />
        <AuthButton loading={isLoading}>Sign In</AuthButton>
      </form>

      <AuthDivider />

      {/* Links */}
      <div style={{
        textAlign: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}>
        <span style={{
          fontSize: 13,
          color: "var(--color-text-muted)",
          cursor: "default",
        }}>
          Forgot password? (coming soon)
        </span>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          Don't have an account?{" "}
          <Link
            href="/register"
            style={{ color: "var(--color-text)", fontWeight: 600, textDecoration: "none" }}
          >
            Sign up
          </Link>
        </p>
        <p style={{ fontSize: 11, color: "var(--color-text-disabled)" }}>
          Not sure of your org?{" "}
          <Link
            href="/signin"
            style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
          >
            Find your workspace
          </Link>
        </p>
      </div>
    </>
  );
}

// ── Suspense fallback ─────────────────────────────────────────────
function SignInFallback() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 12,
      width: "100%",
      maxWidth: 320,
    }}>
      {/* Skeleton lines */}
      {[100, 60, 36, 36, 36].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? 24 : i < 3 ? 12 : 36,
          width: `${w}%`,
          background: "var(--color-border-subtle)",
          borderRadius: "var(--brand-radius-sm)",
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
      ))}
    </div>
  );
}

// ── Page export — Suspense boundary required for useSearchParams ──
export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInForm />
    </Suspense>
  );
}