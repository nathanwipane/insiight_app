"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { OrgSetUpForm } from "@/app/(auth)/register/create-profile/page";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

interface StepOrgDetailsProps {
  formData: OrgSetUpForm;
  handleOrgFormChange: (field: keyof OrgSetUpForm, value: string) => void;
  createOrganisation: () => void;
  isLoading?: boolean;
  error?: string;
  goToPrev: () => void;
}

const COMPANY_SIZES = [
  "Just me", "2-10 employees", "11-50 employees",
  "51-200 employees", "201-1000 employees", "1000+ employees",
];

const INDUSTRIES = [
  "Advertising & Marketing", "Media & Entertainment", "Technology",
  "Retail & E-commerce", "Financial Services", "Healthcare",
  "Real Estate", "Automotive", "Food & Beverage", "Other",
];

const ORG_TYPES = [
  "Brand/Advertiser", "Media Owner", "Advertising Agency",
  "Media Agency", "Technology Provider", "Consultant", "Other",
];

export default function StepOrgDetails({
  formData, handleOrgFormChange, createOrganisation, isLoading, error, goToPrev,
}: StepOrgDetailsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof OrgSetUpForm, value: string) => {
    handleOrgFormChange(field, value);
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.organisation_name.trim())  newErrors.organisation_name     = "Organisation name is required";
    if (!formData.organisation_size)         newErrors.organisation_size     = "Company size is required";
    if (!formData.organisation_industry)     newErrors.organisation_industry = "Industry is required";
    if (!formData.organisation_type)         newErrors.organisation_type     = "Organisation type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) createOrganisation();
  };

  return (
    <>
      {/* Back button */}
      <button
        onClick={goToPrev}
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
          <span>org_details</span>
        </div>
        <h1 style={{
          fontSize: 19, fontWeight: 600, color: "var(--color-text)",
          letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 6,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          Create your organisation
        </h1>
        <p style={{
          fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.55,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          This is where your team will work and collaborate.
        </p>
      </div>

      {/* Org name */}
      <AuthInput
        label="organisation name"
        type="text"
        value={formData.organisation_name}
        onChange={e => handleInputChange("organisation_name", e.target.value)}
        placeholder="Acme Inc."
        required
      />
      {errors.organisation_name && <ErrorMsg>{errors.organisation_name}</ErrorMsg>}

      {/* Company size */}
      <SelectField
        label="company size"
        value={formData.organisation_size}
        options={COMPANY_SIZES}
        onChange={v => handleInputChange("organisation_size", v)}
        error={errors.organisation_size}
      />

      {/* Industry */}
      <SelectField
        label="industry"
        value={formData.organisation_industry}
        options={INDUSTRIES}
        onChange={v => handleInputChange("organisation_industry", v)}
        error={errors.organisation_industry}
      />

      {/* Org type */}
      <SelectField
        label="organisation type"
        value={formData.organisation_type}
        options={ORG_TYPES}
        onChange={v => handleInputChange("organisation_type", v)}
        error={errors.organisation_type}
      />

      {/* Website — optional */}
      <div style={{ marginBottom: 18 }}>
        <label className="auth-label">
          website <span style={{ color: "var(--color-text-disabled)" }}>(optional)</span>
        </label>
        <input
          className="auth-input"
          type="url"
          value={formData.organisation_website}
          onChange={e => handleInputChange("organisation_website", e.target.value)}
          placeholder="https://yourcompany.com"
        />
      </div>

      {/* API error from parent */}
      {error && (
        <div style={{
          marginBottom: 14,
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

      <AuthButton
        type="button"
        onClick={handleSubmit}
        loading={isLoading}
        loadingText="Creating organisation..."
      >
        Create Organisation
      </AuthButton>
    </>
  );
}

function SelectField({ label, value, options, onChange, error }: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="auth-label">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="auth-input"
        style={{ cursor: "pointer" }}
      >
        <option value="" disabled>Select...</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </div>
  );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 11,
      color: "#dc2626",
      marginTop: -8,
      marginBottom: 10,
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {children}
    </p>
  );
}