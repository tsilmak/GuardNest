import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowBackIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface EmailAuthPageProps {
  onBack: () => void;
  onNext: (email: string) => void;
}

export default function EmailAuthPage({ onBack, onNext }: EmailAuthPageProps) {
  const form = useForm<{ email: string }>({
    mode: "onChange",
    defaultValues: { email: "" },
  });
  const [email, setEmail] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

  const validateEmail = (value: string) => {
    if (!value.trim()) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? "" : "Please enter a valid email address";
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setValidationMessage(validateEmail(value));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateEmail(email);
    if (!validation && email.trim()) {
      onNext(email.trim());
    } else {
      setValidationMessage(validation);
    }
  };

  const isEmailValid = email.trim() && !validationMessage;

  return (
    <div className="min-h-screen max-w-2xl mx-auto py-6">
      <Button
        size="icon"
        variant="ghost"
        onClick={onBack}
        className="flex items-center justify-center"
      >
        <ArrowBackIcon className="w-6 h-6" />
      </Button>
      {/* Main content */}
      <div className="px-2">
        <div>
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-1.5">
              What's your email?
            </h2>
            <p className="text-neutral-600 font-medium leading-relaxed">
              Enter your email to log into a Guardan account or create a new
              one.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={handleFormSubmit}>
              {/* Email input */}
              <div className="mb-8">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  autoComplete="email"
                  required
                  name="email"
                  label={"Email"}
                  validationMessage={validationMessage}
                />
              </div>

              {/* Next button */}
              <Button
                type="submit"
                className={`w-full justify-center`}
                disabled={!isEmailValid}
                variant={"primary"}
                size={"md"}
              >
                Next
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
