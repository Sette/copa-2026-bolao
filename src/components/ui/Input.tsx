interface InputProps {
  label?: string;
  type?: "text" | "number" | "email" | "password";
  placeholder?: string;
  value?: string | number;
  min?: number;
  max?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}

export function Input({
  label,
  type = "text",
  placeholder,
  value,
  min,
  max,
  required,
  disabled,
  className = "",
  onChange,
}: InputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-zinc-700">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-zinc-100 disabled:text-zinc-700"
      />
    </div>
  );
}
