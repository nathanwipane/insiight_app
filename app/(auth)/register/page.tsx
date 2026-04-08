"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Building2, Users, ArrowLeft, CheckCircle } from "lucide-react";
import AuthHeading from "@/components/auth/AuthHeading";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import AuthDivider from "@/components/auth/AuthDivider";
import { trackCustomEvent, trackEventWithUserData } from "@/lib/metaPixel";
import { REGISTER_EMAIL_CONVERSION_ID, trackLinkedInConversion } from "@/lib/linkedIn";

type AccountType = "media_owner" | "media_agency" | null;
type Step = "role" | "email" | "success";

function RegisterForm() {
  const [step, setStep]               = useState<Step>("role");
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [email, setEmail]             = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  const handleRoleSelection = (role: "media_owner" | "media_agency") => {
    setAccountType(role);
    setStep("email");
    trackCustomEvent("selectAccountType", {
      eventCategory: "registration",
      eventLabel: `Selected ${role}`,
      accountType: role,
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions.");
      return;
    }

    setLoading(true);

    trackEventWithUserData("StartTrial", { email, accountType });
    trackEventWithUserData("Lead", { email, accountType });
    trackCustomEvent("registerEmail", {
      eventCategory: "register_email",
      eventLabel: "Register Email",
      location: "Register Email Page",
      accountType,
    });
    trackLinkedInConversion(REGISTER_EMAIL_CONVERSION_ID, { email });

    try {
      const response = await fetch("/api/send-register-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: email, accountType }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send verification email.");
        setLoading(false);
        return;
      }

      if (data.message === "User Already Exists") {
        setError("An account with this email already exists. Please sign in.");
        setLoading(false);
        return;
      }

      setStep("success");
    } catch {
      setError("An error occurred. Please try again.");
    }

    setLoading(false);
  };

  // ── Success state ────────────────────────────────────────────────
  if (step === "success") {
    return (
      <>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          marginBottom: 28,
          textAlign: "center",
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "var(--color-primary-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <CheckCircle size={22} color="var(--color-primary)" />
          </div>
          <div>
            <div style={{
              fontSize: 10,
              color: "var(--color-text-muted)",
              letterSpacing: "0.08em",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}>
              <span style={{ color: "var(--color-primary)" }}>›</span>
              <span>auth.register</span>
              <span style={{ color: "var(--color-border)" }}>—</span>
              <span>email_sent</span>
            </div>
            <h1 style={{
              fontSize: 19,
              fontWeight: 600,
              color: "var(--color-text)",
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
              marginBottom: 6,
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}>
              Check your email
            </h1>
            <p style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              lineHeight: 1.6,
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}>
              We sent a verification link to{" "}
              <span style={{ color: "var(--color-text)", fontWeight: 600 }}>{email}</span>
              . The link expires in 5 days.
            </p>
          </div>
        </div>

        <AuthDivider />

        <div style={{
          textAlign: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Didn't receive it?{" "}
            <button
              onClick={() => { setStep("email"); setEmail(""); }}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-text)",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 12,
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              Try again
            </button>
          </p>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Already have an account?{" "}
            <Link href="/signin" style={{ color: "var(--color-text)", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </>
    );
  }

  // ── Role selection step ──────────────────────────────────────────
  if (step === "role") {
    return (
      <>
        <AuthHeading
          path="auth.register"
          title="Create your account"
          subtitle="Select the option that best describes your business."
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {/* Media Owner */}
          <button
            onClick={() => handleRoleSelection("media_owner")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 16px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--brand-radius-md)",
              cursor: "pointer",
              textAlign: "left",
              transition: "border-color 0.15s",
              width: "100%",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-primary)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
          >
            <div style={{
              width: 34,
              height: 34,
              borderRadius: "var(--brand-radius-sm)",
              background: "var(--color-primary-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <Building2 size={16} color="var(--color-primary)" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", fontFamily: "system-ui, -apple-system, sans-serif" }}>
                Media Owner
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "system-ui, -apple-system, sans-serif", marginTop: 2 }}>
                Billboard operators and OOH asset owners
              </div>
            </div>
          </button>

          {/* Media Agency */}
          <button
            onClick={() => handleRoleSelection("media_agency")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 16px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--brand-radius-md)",
              cursor: "pointer",
              textAlign: "left",
              transition: "border-color 0.15s",
              width: "100%",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-primary)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
          >
            <div style={{
              width: 34,
              height: 34,
              borderRadius: "var(--brand-radius-sm)",
              background: "var(--color-primary-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <Users size={16} color="var(--color-primary)" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", fontFamily: "system-ui, -apple-system, sans-serif" }}>
                Media Agency
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "system-ui, -apple-system, sans-serif", marginTop: 2 }}>
                Agencies planning and buying OOH campaigns
              </div>
            </div>
          </button>
        </div>

        <AuthDivider />

        <div style={{ textAlign: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Already have an account?{" "}
            <Link href="/signin" style={{ color: "var(--color-text)", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </>
    );
  }

  // ── Email capture step ───────────────────────────────────────────
  return (
    <>
      {/* Back button + heading */}
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={() => setStep("role")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            fontSize: 11,
            letterSpacing: "0.04em",
            padding: 0,
            marginBottom: 16,
            fontFamily: "var(--font-mono)",
          }}
        >
          <ArrowLeft size={11} />
          back
        </button>

        {/* Account type badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "var(--color-primary-subtle)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--brand-radius-sm)",
          padding: "3px 8px",
          marginBottom: 12,
        }}>
          {accountType === "media_owner"
            ? <Building2 size={10} color="var(--color-primary)" />
            : <Users size={10} color="var(--color-primary)" />
          }
          <span style={{ fontSize: 9, color: "var(--color-primary)", letterSpacing: "0.1em" }}>
            {accountType === "media_owner" ? "MEDIA OWNER" : "MEDIA AGENCY"}
          </span>
        </div>

        <div style={{
          fontSize: 10,
          color: "var(--color-text-muted)",
          letterSpacing: "0.08em",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <span style={{ color: "var(--color-primary)" }}>›</span>
          <span>auth.register</span>
          <span style={{ color: "var(--color-border)" }}>—</span>
          <span>email</span>
        </div>

        <h1 style={{
          fontSize: 19,
          fontWeight: 600,
          color: "var(--color-text)",
          marginBottom: 6,
          letterSpacing: "-0.02em",
          lineHeight: 1.3,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          Get started for free
        </h1>
        <p style={{
          fontSize: 12,
          color: "var(--color-text-muted)",
          lineHeight: 1.55,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          Enter your work email to receive a verification link.
        </p>
      </div>

      {/* Error */}
      {error && (
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
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleEmailSubmit}>
        <AuthInput
          label="email_address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@organisation.com"
          required
        />

        {/* Terms checkbox */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          marginBottom: 14,
        }}>
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={e => setAgreedToTerms(e.target.checked)}
            style={{ marginTop: 2, accentColor: "var(--color-primary)", flexShrink: 0 }}
          />
          <label
            htmlFor="terms"
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              lineHeight: 1.5,
              fontFamily: "system-ui, -apple-system, sans-serif",
              cursor: "pointer",
            }}
          >
            I agree to the{" "}
            <Link href="/legal/terms-of-use" style={{ color: "var(--color-text)", textDecoration: "underline" }}>
              terms of use
            </Link>
            {" "}and{" "}
            <Link href="/legal/privacy-policy" style={{ color: "var(--color-text)", textDecoration: "underline" }}>
              privacy policy
            </Link>
          </label>
        </div>

        <AuthButton loading={loading} loadingText="Sending verification email...">
          Get Started For Free
        </AuthButton>
      </form>

      <AuthDivider />

      <div style={{ textAlign: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
          Already have an account?{" "}
          <Link href="/signin" style={{ color: "var(--color-text)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}

// ── Suspense fallback ─────────────────────────────────────────────
function RegisterFallback() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 12,
      width: "100%",
      maxWidth: 320,
    }}>
      {[100, 60, 80, 80, 36].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? 24 : i < 2 ? 12 : i < 4 ? 56 : 36,
          width: `${w}%`,
          background: "var(--color-border-subtle)",
          borderRadius: "var(--brand-radius-sm)",
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
      ))}
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────
export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterForm />
    </Suspense>
  );
}