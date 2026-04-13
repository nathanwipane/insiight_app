"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { UserSetupForm } from "@/app/(auth)/register/create-profile/page";
import AuthHeading from "@/components/auth/AuthHeading";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import { trackCustomEvent, trackEventWithUserData } from "@/lib/metaPixel";

interface StepUserDetailsProps {
  formData: UserSetupForm;
  handleUserInputChange: (field: keyof UserSetupForm, value: string) => void;
  goToNext: () => void;
}

export default function StepUserDetails({ formData, handleUserInputChange, goToNext }: StepUserDetailsProps) {
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword]         = useState("");
  const [errors, setErrors]                           = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof UserSetupForm, value: string) => {
    handleUserInputChange(field, value);
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.userFirstName.trim())  newErrors.userFirstName  = "First name is required";
    if (!formData.userLastName.trim())   newErrors.userLastName   = "Last name is required";
    if (!formData.userPassword)          newErrors.userPassword   = "Password is required";
    else if (formData.userPassword.length < 8) newErrors.userPassword = "Password must be at least 8 characters";
    if (!confirmPassword)                newErrors.confirmPassword = "Please confirm your password";
    else if (formData.userPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    trackEventWithUserData("Lead", {
      email:     formData.userEmail,
      firstName: formData.userFirstName,
      lastName:  formData.userLastName,
    });
    trackCustomEvent("finishUserDetails", {
      eventCategory: "register_user_details",
      eventLabel:    "Register User Details Completed",
      email:         formData.userEmail,
      firstName:     formData.userFirstName,
      lastName:      formData.userLastName,
    });
    goToNext();
  };

  const isValid = formData.userFirstName.trim()
    && formData.userLastName.trim()
    && formData.userPassword.length >= 8
    && confirmPassword
    && formData.userPassword === confirmPassword;

  return (
    <>
      <AuthHeading
        path="auth.register"
        title="Hi there, what's your name?"
        subtitle="Set up your personal details to get started."
      />

      {/* Pre-filled email — read only */}
      <div style={{ marginBottom: 12 }}>
        <label className="auth-label">email address</label>
        <input
          className="auth-input"
          type="email"
          value={formData.userEmail}
          readOnly
          style={{ opacity: 0.5, cursor: "not-allowed" }}
        />
      </div>

      {/* First name */}
      <AuthInput
        label="first name"
        type="text"
        value={formData.userFirstName}
        onChange={e => handleInputChange("userFirstName", e.target.value)}
        placeholder="First name"
        required
      />
      {errors.userFirstName && <ErrorMsg>{errors.userFirstName}</ErrorMsg>}

      {/* Last name */}
      <AuthInput
        label="last name"
        type="text"
        value={formData.userLastName}
        onChange={e => handleInputChange("userLastName", e.target.value)}
        placeholder="Last name"
        required
      />
      {errors.userLastName && <ErrorMsg>{errors.userLastName}</ErrorMsg>}

      {/* Password */}
      <div style={{ marginBottom: 12 }}>
        <label className="auth-label">password</label>
        <div style={{ position: "relative" }}>
          <input
            className="auth-input"
            type={showPassword ? "text" : "password"}
            value={formData.userPassword}
            onChange={e => handleInputChange("userPassword", e.target.value)}
            placeholder="Min. 8 characters"
            style={{ paddingRight: 32 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={{
              position: "absolute", right: 10, top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none",
              color: "var(--color-text-muted)", cursor: "pointer",
              display: "flex", alignItems: "center", padding: 2,
            }}
          >
            {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
        {errors.userPassword && <ErrorMsg>{errors.userPassword}</ErrorMsg>}
      </div>

      {/* Confirm password */}
      <div style={{ marginBottom: 18 }}>
        <label className="auth-label">confirm password</label>
        <div style={{ position: "relative" }}>
          <input
            className="auth-input"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={e => handleConfirmPasswordChange(e.target.value)}
            placeholder="Re-enter password"
            style={{ paddingRight: 32 }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(v => !v)}
            style={{
              position: "absolute", right: 10, top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none",
              color: "var(--color-text-muted)", cursor: "pointer",
              display: "flex", alignItems: "center", padding: 2,
            }}
          >
            {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
        {errors.confirmPassword && <ErrorMsg>{errors.confirmPassword}</ErrorMsg>}
      </div>

      <AuthButton
        type="button"
        onClick={handleNext}
        loading={false}
        loadingText="Validating..."
      >
        {isValid ? "Next →" : "Next"}
      </AuthButton>
    </>
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