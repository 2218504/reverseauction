"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      // Redirection is handled by the login function and useEffect
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "An unknown error occurred.",
      });
      setIsSubmitting(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 mx-auto border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-transparent border-t-teal-400 rounded-full animate-spin animation-delay-300"></div>
          </div>
          <p className="text-gray-600 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-emerald-300/20 to-teal-300/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-8 -right-8 w-96 h-96 bg-gradient-to-r from-cyan-300/20 to-blue-300/20 rounded-full blur-xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-teal-300/10 to-emerald-300/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-300/10 to-teal-300/10 rounded-full blur-2xl animate-float-reverse"></div>
      </div>

      <Card
        className={`w-full max-w-md relative backdrop-blur-sm bg-white/85 border-0 shadow-2xl transition-all duration-700 ${
          mounted
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95"
        }`}
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
          boxShadow:
            "0 32px 64px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.6)",
        }}
      >
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-sm -z-10"></div>

        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300 hover:rotate-[-3deg]">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl font-headline bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2 group">
              <Label
                htmlFor="email"
                className={`text-sm font-medium transition-colors duration-200 ${
                  focusedField === "email"
                    ? "text-emerald-600"
                    : "text-gray-700"
                }`}
              >
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={isSubmitting}
                  className={`pl-12 h-12 transition-all duration-300 border-2 ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  } ${
                    focusedField === "email"
                      ? "border-emerald-400 ring-4 ring-emerald-100 bg-emerald-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${email ? "bg-green-50/30 border-green-200" : ""}`}
                />
                <div
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    focusedField === "email"
                      ? "text-emerald-500"
                      : "text-gray-400"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                {email && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 group">
              <Label
                htmlFor="password"
                className={`text-sm font-medium transition-colors duration-200 ${
                  focusedField === "password"
                    ? "text-emerald-600"
                    : "text-gray-700"
                }`}
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={isSubmitting}
                  className={`pl-12 pr-12 h-12 transition-all duration-300 border-2 ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  } ${
                    focusedField === "password"
                      ? "border-emerald-400 ring-4 ring-emerald-100 bg-emerald-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${password ? "bg-green-50/30 border-green-200" : ""}`}
                />
                <div
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    focusedField === "password"
                      ? "text-emerald-500"
                      : "text-gray-400"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 hover:text-emerald-600 focus:outline-none ${
                    isSubmitting
                      ? "cursor-not-allowed opacity-50"
                      : "text-gray-400"
                  }`}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full h-12 text-lg font-semibold relative overflow-hidden group transition-all duration-300 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed scale-95"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 hover:shadow-xl active:scale-95"
              }`}
              disabled={isSubmitting}
            >
              <span
                className={`transition-all duration-300 ${
                  isSubmitting ? "opacity-0" : "opacity-100"
                }`}
              >
                Sign In
              </span>
              {isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                </div>
              )}
              {!isSubmitting && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              )}
            </Button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center">
            <button className="text-sm text-emerald-600 hover:text-emerald-800 transition-colors duration-200 hover:underline decoration-2 underline-offset-4">
              Forgot your password?
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-emerald-600 hover:text-emerald-800 transition-all duration-200 underline underline-offset-4 decoration-emerald-500 hover:decoration-emerald-700"
              >
                Click here to register
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-15px) rotate(2deg);
          }
          66% {
            transform: translateY(10px) rotate(-1deg);
          }
        }

        @keyframes float-reverse {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(12px) rotate(-2deg);
          }
          66% {
            transform: translateY(-8px) rotate(1deg);
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: float-reverse 10s ease-in-out infinite;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
