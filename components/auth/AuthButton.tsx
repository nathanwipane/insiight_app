import type { ReactNode } from "react";

type AuthButtonProps = {
  children: ReactNode;
  loading?: boolean;
  loadingText?: string;
  type?: "submit" | "button";
  onClick?: () => void;
};

export default function AuthButton({
  children,
  loading = false,
  loadingText = "authenticating...",
  type = "submit",
  onClick,
}: AuthButtonProps) {
  return (
    <button
      className="auth-btn-primary"
      type={type}
      disabled={loading}
      onClick={onClick}
      style={{ marginBottom: 18 }}
    >
      {loading ? loadingText : children}
    </button>
  );
}