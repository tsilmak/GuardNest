"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import EmailAuthPage from "@/components/auth/email-auth-page";
import {
  AppleIcon,
  EmailIcon,
  GoogleIcon,
  PopUpIcon,
} from "@/components/icons";

export default function AuthPage() {
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setAuthError(decodeURIComponent(error));
      // Show email login form when there's an error
      setShowEmailLogin(true);
    }
  }, [searchParams]);

  const handleEmailLogin = () => {
    setShowEmailLogin(true);
    setAuthError(null); // Clear error when user manually tries again
  };

  const handleBackToMain = () => {
    setShowEmailLogin(false);
  };

  const handleNext = (email: string) => {
    console.log("Next clicked with email:", email);
  };

  if (showEmailLogin) {
    return (
      <div className="min-h-screen flex flex-col">
        {authError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 mx-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{authError}</p>
              </div>
            </div>
          </div>
        )}
        <EmailAuthPage onBack={handleBackToMain} onNext={handleNext} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col ">
      {/* Error Display */}
      {authError && !showEmailLogin && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 mx-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{authError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 ">
        <div className="max-w-xl w-full space-y-8">
          {/* Meta Logo */}
          <div className="flex justify-center">
            <div className="w-24 h-8 text-2xl font-bold py-8">Guardan</div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-lg font-semibold text-neutral-900">
              Log in or create a Guardan account
            </h1>
          </div>

          {/* Login Buttons */}
          <div className="space-y-3" role="list">
            {/* Apple Button */}
            <div role="listitem">
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={() => {}}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5">
                    <AppleIcon className="w-5 h-5" />
                  </div>
                  <span>Continue with Apple ID</span>
                </div>
                <PopUpIcon className="w-4 h-4" />
              </Button>
            </div>
            {/* Google Button */}
            <div role="listitem">
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={() => {}}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5">
                    <GoogleIcon className="w-5 h-5" />
                  </div>
                  <span>Continue with Google</span>
                </div>
                <PopUpIcon className="w-4 h-4" />
              </Button>
            </div>
            {/* Email Button */}
            <div role="listitem">
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={handleEmailLogin}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5">
                    <EmailIcon className="w-5 h-5" />
                  </div>
                  <span>Continue with email</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 font-semibold space-x-1 py-8">
        <span>© Guardan 2025</span>
        <span>·</span>
        <a
          href=""
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:underline"
        >
          Privacy
        </a>
        <span>·</span>
        <a
          href=""
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:underline"
        >
          Terms
        </a>
        <span>·</span>
        <Button className="text-gray-400 hover:underline bg-transparent border-0 p-0 h-auto">
          English (US)
        </Button>
      </div>
    </div>
  );
}
