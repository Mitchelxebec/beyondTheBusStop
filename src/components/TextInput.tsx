import { type InputHTMLAttributes, type ReactNode, forwardRef } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Icon or node shown on the left inside the input. */
  leadingIcon?: ReactNode;
  /** Icon or node shown on the right inside the input. */
  trailingIcon?: ReactNode;
  /** Helper text or error message below the input. */
  helperText?: string;
  /** Show error styling. */
  error?: boolean;
}

/**
 * Labelled text input with optional leading/trailing icon slots.
 * Appears on: Login, Register, Phone Entry, and most form screens.
 */
const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      leadingIcon,
      trailingIcon,
      helperText,
      error,
      className = "",
      id,
      ...rest
    },
    ref
  ) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700 px-1"
        >
          {label}
        </label>
        <div
          className={`flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3.5 border transition-colors ${
            error
              ? "border-red-400 focus-within:border-red-500"
              : "border-gray-200 focus-within:border-gray-400"
          } ${className}`}
        >
          {leadingIcon && (
            <span className="text-gray-500 text-lg shrink-0">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-sm outline-none"
            {...rest}
          />
          {trailingIcon && (
            <span className="text-gray-500 text-lg shrink-0">
              {trailingIcon}
            </span>
          )}
        </div>
        {helperText && (
          <p
            className={`text-xs px-1 ${error ? "text-red-500" : "text-gray-500"}`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

export default TextInput;
