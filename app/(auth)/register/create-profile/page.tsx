"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import StepUserDetails from "@/components/auth/register/StepUserDetails";
import StepUserRole from "@/components/auth/register/StepUserRole";
import StepOrgDetails from "@/components/auth/register/StepOrgDetails";
import { generateParentOrgId } from "@/lib/utils";
import { createUser } from "@/lib/users";
import { trackCustomEvent, trackEventWithUserData } from "@/lib/metaPixel";
import { COMPLETE_REGISTRATION_CONVERSION_ID, trackLinkedInConversion } from "@/lib/linkedIn";

// ── Types ─────────────────────────────────────────────────────────
export interface UserSetupForm {
  userFirstName:  string;
  userLastName:   string;
  userEmail:      string;
  userPassword:   string;
  userRole:       string;
  userWorkStream: string;
}

export interface OrgSetUpForm {
  organisation_name:     string;
  organisation_size:     string;
  organisation_industry: string;
  organisation_type:     string;
  organisation_website:  string;
}

const defaultUserSetupForm: UserSetupForm = {
  userFirstName:  "",
  userLastName:   "",
  userEmail:      "",
  userPassword:   "",
  userRole:       "",
  userWorkStream: "",
};

const defaultOrgSetupForm: OrgSetUpForm = {
  organisation_name:     "",
  organisation_size:     "",
  organisation_industry: "",
  organisation_type:     "",
  organisation_website:  "",
};

// ── Step indicator ────────────────────────────────────────────────
const STEPS = [
  { label: "user_details",  title: "User Details"         },
  { label: "user_roles",    title: "Roles"                },
  { label: "org_details",   title: "Organisation"         },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginBottom: 28,
    }}>
      {STEPS.map((s, i) => (
        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <div style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: i < current
                ? "var(--color-text)"
                : i === current
                  ? "var(--color-primary)"
                  : "var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              color: "#fff",
              fontWeight: 600,
              flexShrink: 0,
            }}>
              {i < current ? "✓" : i + 1}
            </div>
            <span style={{
              fontSize: 10,
              color: i === current ? "var(--color-text)" : "var(--color-text-muted)",
              letterSpacing: "0.06em",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              width: 20,
              height: 1,
              background: i < current ? "var(--color-text)" : "var(--color-border)",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
function CreateProfileComponent() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const accountType   = searchParams.get("accountType");

  const [step, setStep]                 = useState(0);
  const [userForm, setUserForm]         = useState<UserSetupForm>(defaultUserSetupForm);
  const [orgForm, setOrgForm]           = useState<OrgSetUpForm>(defaultOrgSetupForm);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);

// ── Decode token on mount ──────────────────────────────────────
useEffect(() => {

  // DEV: comment out this block to bypass token decode while testing
  setUserForm(prev => ({ ...prev, userEmail: "test@test.com" }));
  return;
  // END DEV

  const token = searchParams.get("token");
  if (!token) return;

  const decodeToken = async () => {
    try {
      const response = await fetch("/api/auth/decode-verification-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (result.success && result.data?.email) {
        setUserForm(prev => ({ ...prev, userEmail: result.data.email }));
      } else if (result.code === "TOKEN_EXPIRED") {
        setTokenExpired(true);
      } else {
        setError("Invalid invitation link. Please contact your administrator.");
      }
    } catch {
      setError("Unable to verify invitation link. Please try again.");
    }
  };

  decodeToken();
}, [searchParams]);

  // ── Form field handlers ────────────────────────────────────────
  const handleUserFormChange = (field: keyof UserSetupForm, value: string) => {
    setUserForm(prev => ({ ...prev, [field]: value }));
  };

  const handleOrgFormChange = (field: keyof OrgSetUpForm, value: string) => {
    setOrgForm(prev => ({ ...prev, [field]: value }));
  };

  const goToNext = () => setStep(s => s + 1);

  // ── Final submit ───────────────────────────────────────────────
  const handleCreateOrganisation = async () => {
    setLoading(true);
    setError("");

    trackCustomEvent("finishRegistration", {
      eventCategory: "finish_registration",
      eventLabel: "Registration Completed",
      ...userForm,
      ...orgForm,
    });
    trackEventWithUserData("Lead",                { email: userForm.userEmail, firstName: userForm.userFirstName, lastName: userForm.userLastName });
    trackEventWithUserData("StartTrial",          { email: userForm.userEmail, firstName: userForm.userFirstName, lastName: userForm.userLastName });
    trackEventWithUserData("CompleteRegistration",{ email: userForm.userEmail, firstName: userForm.userFirstName, lastName: userForm.userLastName });
    trackLinkedInConversion(COMPLETE_REGISTRATION_CONVERSION_ID, {
      email:       userForm.userEmail,
      firstName:   userForm.userFirstName,
      lastName:    userForm.userLastName,
      companyName: orgForm.organisation_name,
      title:       userForm.userRole,
      countryCode: "AU",
    });

    try {
      const parent_org_id = generateParentOrgId(orgForm.organisation_name);

      // 1. Create organisation + database
      const orgRes = await fetch("/api/create-client-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: orgForm.organisation_name,
          client_id:   parent_org_id,
          plan_type:   "trial",
          org_type:    accountType,
          logo:        "https://shiine-assets.s3.ap-southeast-2.amazonaws.com/images/InsiightLogo-Modern-Purple.png",
          asset_type:  "traditional",
          db_name:     `insiight_${parent_org_id.toLowerCase()}_db`,
          metadata: {
            organisation_size:     orgForm.organisation_size,
            organisation_industry: orgForm.organisation_industry,
            organisation_type:     orgForm.organisation_type,
            organisation_website:  orgForm.organisation_website,
          },
        }),
      });

      const orgResult = await orgRes.json();

      if (orgResult.status !== "completed") {
        setError("Failed to create organisation. Please try again.");
        toast.error("Failed to create organisation. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Create user
      const userRes = await createUser({
        email:           userForm.userEmail,
        password:        userForm.userPassword,
        first_name:      userForm.userFirstName,
        last_name:       userForm.userLastName,
        organisation_id: orgResult.client_info.org_id,
        role_id:         accountType === "media_owner" ? 2 : 4,
        new:             1,
      }, parent_org_id);

      if (!userRes) {
        setError("Failed to create account. Please try again.");
        toast.error("Failed to create account. Please try again.");
        setLoading(false);
        return;
      }

      if (userRes === "User Already Exists") {
        setError("An account with this email already exists. Please sign in.");
        toast.error("An account with this email already exists.");
        setLoading(false);
        return;
      }

      // 3. Auto sign in and redirect
      if (userRes.email) {
        const signInResult = await signIn("credentials", {
          email:        userForm.userEmail,
          password:     userForm.userPassword,
          parent_org_id,
          redirect:     false,
        });

        if (signInResult?.ok) {
          toast.success("Account created successfully. Redirecting...");
          setLoading(false);
          router.push(`/${parent_org_id}/dashboard`);
        } else {
          setLoading(false);
          setError("Account created but sign-in failed. Please sign in manually.");
          toast.error("Sign-in failed. Please sign in manually.");
        }
      }
    } catch {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  // ── Token expired state ────────────────────────────────────────
  if (tokenExpired) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 10,
          color: "var(--color-text-muted)",
          letterSpacing: "0.08em",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}>
          <span style={{ color: "#dc2626" }}>›</span>
          <span>auth.register</span>
          <span style={{ color: "var(--color-border)" }}>—</span>
          <span>link_expired</span>
        </div>
        <h1 style={{
          fontSize: 19,
          fontWeight: 600,
          color: "var(--color-text)",
          marginBottom: 8,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          This link has expired
        </h1>
        <p style={{
          fontSize: 12,
          color: "var(--color-text-muted)",
          lineHeight: 1.6,
          marginBottom: 20,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          Verification links expire after 5 days. Register again to receive a new link.
        </p>
        <a
          href="/register"
          style={{
            display: "inline-block",
            padding: "9px 20px",
            background: "var(--color-text)",
            color: "#fff",
            borderRadius: "var(--brand-radius-md)",
            fontSize: 12,
            fontWeight: 600,
            textDecoration: "none",
            fontFamily: "var(--font-mono)",
          }}
        >
          Back to register
        </a>
      </div>
    );
  }

  // ── Wizard steps ───────────────────────────────────────────────
  return (
    <>
      <StepIndicator current={step} />

      {step === 0 && (
        <StepUserDetails
          formData={userForm}
          handleUserInputChange={handleUserFormChange}
          goToNext={goToNext}
        />
      )}
        {step === 1 && (
        <StepUserRole
            formData={userForm}
            handleUserInputChange={handleUserFormChange}
            goToNext={goToNext}
            goToPrev={() => setStep(0)}
        />
        )}
        {step === 2 && (
        <StepOrgDetails
            formData={orgForm}
            handleOrgFormChange={handleOrgFormChange}
            createOrganisation={handleCreateOrganisation}
            isLoading={loading}
            error={error}
            goToPrev={() => setStep(1)}
        />
        )}

      {error && step < 2 && (
        <div style={{
          marginTop: 12,
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
    </>
  );
}

// ── Suspense fallback ─────────────────────────────────────────────
function CreateProfileFallback() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 12,
      width: "100%",
      maxWidth: 320,
    }}>
      {[60, 100, 36, 36, 36, 36].map((w, i) => (
        <div key={i} style={{
          height: i < 2 ? 14 : 36,
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
export default function CreateProfilePage() {
  return (
    <Suspense fallback={<CreateProfileFallback />}>
      <CreateProfileComponent />
    </Suspense>
  );
}