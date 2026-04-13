"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { UserSetupForm } from "@/app/(auth)/register/create-profile/page";
import AuthButton from "@/components/auth/AuthButton";
import { trackCustomEvent } from "@/lib/metaPixel";

interface StepUserRoleProps {
  formData: UserSetupForm;
  handleUserInputChange: (field: keyof UserSetupForm, value: string) => void;
  goToNext: () => void;
  goToPrev: () => void;
}

const ROLES = [
  "Brand Manager", "Marketing Director", "Media Owner",
  "Agency Account Manager", "Digital Marketing Manager",
  "Campaign Manager", "Marketing Analyst", "Creative Director",
  "Media Planner", "Other",
];

const WORKSTREAMS = [
  "Marketing", "Sales", "Operations", "Strategy", "Analytics",
  "Creative", "Media Planning", "Account Management",
  "Business Development", "Other",
];

export default function StepUserRole({ formData, handleUserInputChange, goToNext, goToPrev }: StepUserRoleProps) {
  const [subStep, setSubStep]                       = useState<"role" | "workstream">(
    formData.userWorkStream ? "workstream" : "role"
    );
  const [selectedRole, setSelectedRole]             = useState(formData.userRole || "");
  const [selectedWorkstream, setSelectedWorkstream] = useState(formData.userWorkStream || "");

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    handleUserInputChange("userRole", role);
  };

  const handleWorkstreamSelect = (ws: string) => {
    setSelectedWorkstream(ws);
    handleUserInputChange("userWorkStream", ws);
  };

  const handleNext = () => {
    if (subStep === "role" && selectedRole) {
      setSubStep("workstream");
    } else if (subStep === "workstream" && selectedWorkstream) {
      trackCustomEvent("finishUserRoleAndWork", {
        eventCategory:  "register_user_role_and_work",
        eventLabel:     "Registration User Role and Work Completed",
        email:          formData.userEmail,
        userRole:       selectedRole,
        userWorkStream: selectedWorkstream,
      });
      goToNext();
    }
  };

  // Back: workstream sub-step → role sub-step, role sub-step → previous wizard step
  const handleBack = () => {
    if (subStep === "workstream") {
      setSubStep("role");
    } else {
      goToPrev();
    }
  };

  const isValid  = subStep === "role" ? !!selectedRole : !!(selectedRole && selectedWorkstream);
  const options  = subStep === "role" ? ROLES : WORKSTREAMS;
  const selected = subStep === "role" ? selectedRole : selectedWorkstream;
  const onSelect = subStep === "role" ? handleRoleSelect : handleWorkstreamSelect;

  return (
    <>
      {/* Back button */}
      <button
        onClick={handleBack}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "none", border: "none",
          color: "var(--color-text-muted)", fontSize: 11,
          letterSpacing: "0.04em", cursor: "pointer",
          padding: 0, marginBottom: 16,
          fontFamily: "var(--font-mono)",
        }}
      >
        <ArrowLeft size={11} /> back
      </button>

      {/* Heading */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 10, color: "var(--color-text-muted)",
          letterSpacing: "0.08em", marginBottom: 10,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ color: "var(--color-primary)" }}>›</span>
          <span>auth.register</span>
          <span style={{ color: "var(--color-border)" }}>—</span>
          <span>{subStep === "role" ? "your_role" : "your_workstream"}</span>
        </div>
        <h1 style={{
          fontSize: 19, fontWeight: 600, color: "var(--color-text)",
          letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 6,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          {subStep === "role" ? "What's your role?" : "What kind of work do you do?"}
        </h1>
        <p style={{
          fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.55,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          Help us personalise your experience.
        </p>
      </div>

      {/* Selected role badge when on workstream */}
      {subStep === "workstream" && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "var(--color-surface-alt)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--brand-radius-sm)",
          padding: "3px 8px", marginBottom: 14,
        }}>
          <span style={{ fontSize: 9, color: "var(--color-text-muted)", letterSpacing: "0.08em" }}>
            role: <span style={{ color: "var(--color-text)", fontWeight: 600 }}>{selectedRole}</span>
          </span>
        </div>
      )}

      {/* Pill selection grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {options.map(option => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              fontSize: 11,
              fontFamily: "system-ui, -apple-system, sans-serif",
              cursor: "pointer",
              transition: "all 0.15s",
              border: selected === option
                ? "1px solid var(--color-primary)"
                : "1px solid var(--color-border)",
              background: selected === option
                ? "var(--color-primary-subtle)"
                : "var(--color-surface)",
              color: selected === option
                ? "var(--color-primary)"
                : "var(--color-text-secondary)",
              fontWeight: selected === option ? 600 : 400,
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <AuthButton type="button" onClick={handleNext} loading={false}>
            {subStep === "role" ? "Next →" : "Continue →"}
          </AuthButton>
        </div>
      </div>

      {/* Sub-step dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
        {["role", "workstream"].map(s => (
          <div key={s} style={{
            width: 6, height: 6, borderRadius: "50%",
            background: subStep === s ? "var(--color-primary)" : "var(--color-border)",
            transition: "background 0.2s",
          }} />
        ))}
      </div>
    </>
  );
}