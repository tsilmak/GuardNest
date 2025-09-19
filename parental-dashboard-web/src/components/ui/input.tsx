import * as React from "react";

import { cn } from "@/lib/utils";
import { SuccessCircleIcon, WarningCircleIcon } from "@/components/icons";

type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "children" | "className" | "style"
> & {
  label?: string;
  className?: string;
  containerClassName?: string;
  validationMessage?: string;
};

function FloatingLabel({
  children,
  isFilled,
  hasError,
  htmlFor,
}: {
  children: React.ReactNode;
  isFilled: boolean;
  hasError: boolean;
  htmlFor: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "absolute left-4 text-base",
        hasError ? "" : "transition-all duration-200",
        isFilled ? "top-0.5 text-neutral-600" : "top-4 text-neutral-500",
        "peer-focus:top-0.5 peer-focus:text-blue-600",
        hasError ? "text-red-600 peer-focus:text-red-600" : ""
      )}
    >
      {children}
    </label>
  );
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    className = "",
    containerClassName,
    validationMessage,
    id,
    onChange,
    onBlur,
    placeholder,
    ...rest
  },
  ref
) {
  const autoId = React.useId();
  const inputId = id ?? autoId;

  const [isFilled, setIsFilled] = React.useState<boolean>(
    Boolean((rest as any).value ?? "")
  );
  const [isTyping, setIsTyping] = React.useState<boolean>(false);
  const timeoutRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    if ("value" in rest) {
      const value = (rest as any).value as unknown;
      const str = value == null ? "" : String(value);
      setIsFilled(str.length > 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(rest as any).value]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsFilled(Boolean(e.currentTarget.value));
    setIsTyping(true);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setIsTyping(false);
    }, 500);
    if (onChange) onChange(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsTyping(false);
    if (onBlur) onBlur(e);
  };

  const hasError = Boolean(validationMessage) && !isTyping;
  const shouldShowSuccess =
    isFilled && !Boolean(validationMessage) && !isTyping;

  return (
    <div className={cn("relative", containerClassName)}>
      <input
        id={inputId}
        ref={ref}
        placeholder={placeholder}
        className={cn(
          "peer w-full px-4 text-base border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          label ? "pt-6 pb-2" : "py-3",
          hasError ? "border-red-300 focus:ring-red-500" : "border-neutral-300",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={handleChange}
        onBlur={handleBlur}
        {...rest}
      />

      {shouldShowSuccess && (
        <SuccessCircleIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600" />
      )}

      {label && (
        <FloatingLabel
          isFilled={isFilled}
          hasError={hasError}
          htmlFor={inputId}
        >
          {label}
        </FloatingLabel>
      )}

      {hasError && (
        <div className="flex items-center justify-start text-red-600 gap-1 mt-0.5">
          <WarningCircleIcon className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{validationMessage}</p>
        </div>
      )}
    </div>
  );
});

export { Input };
