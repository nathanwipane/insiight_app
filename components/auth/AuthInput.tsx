type AuthInputProps = {
  label: string;
  type?: "email" | "password" | "text";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
};

export default function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}: AuthInputProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="auth-label">// {label}</label>
      <input
        className="auth-input"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : "off"}
      />
    </div>
  );
}