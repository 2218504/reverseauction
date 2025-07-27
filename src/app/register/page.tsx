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

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { signup, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, name);
      toast({
        title: "Account Created",
        description: "You've been successfully registered and logged in.",
      });
      // Redirection is handled by the AuthProvider now
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message,
      });
      setLoading(false);
    }
  };

  if (authLoading || (!authLoading && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 mx-auto border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-transparent border-t-purple-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="text-gray-600 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -bottom-8 -right-8 w-96 h-96 bg-gradient-to-r from-purple-300/20 to-pink-300/20 rounded-full blur-xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-gradient-to-r from-indigo-300/10 to-blue-300/10 rounded-full blur-2xl animate-float"></div>
      </div>

      <Card
        className={`w-full max-w-md relative backdrop-blur-sm bg-white/80 border-0 shadow-2xl transition-all duration-700 ${
          mounted
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95"
        }`}
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)",
          boxShadow:
            "0 32px 64px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.5)",
        }}
      >
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-sm -z-10"></div>

        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300 hover:rotate-3">
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl font-headline bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Create an Account
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Join ReverseAuction today and start your journey!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2 group">
              <Label
                htmlFor="name"
                className={`text-sm font-medium transition-colors duration-200 ${
                  focusedField === "name" ? "text-indigo-600" : "text-gray-700"
                }`}
              >
                Full Name
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  placeholder=""
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={`pl-12 h-12 transition-all duration-300 border-2 ${
                    focusedField === "name"
                      ? "border-indigo-400 ring-4 ring-indigo-100 bg-indigo-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${name ? "bg-green-50/30 border-green-200" : ""}`}
                />
                <div
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    focusedField === "name"
                      ? "text-indigo-500"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2 group">
              <Label
                htmlFor="email"
                className={`text-sm font-medium transition-colors duration-200 ${
                  focusedField === "email" ? "text-indigo-600" : "text-gray-700"
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
                  className={`pl-12 h-12 transition-all duration-300 border-2 ${
                    focusedField === "email"
                      ? "border-indigo-400 ring-4 ring-indigo-100 bg-indigo-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${email ? "bg-green-50/30 border-green-200" : ""}`}
                />
                <div
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    focusedField === "email"
                      ? "text-indigo-500"
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
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 group">
              <Label
                htmlFor="password"
                className={`text-sm font-medium transition-colors duration-200 ${
                  focusedField === "password"
                    ? "text-indigo-600"
                    : "text-gray-700"
                }`}
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={`pl-12 h-12 transition-all duration-300 border-2 ${
                    focusedField === "password"
                      ? "border-indigo-400 ring-4 ring-indigo-100 bg-indigo-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${
                    password.length >= 6
                      ? "bg-green-50/30 border-green-200"
                      : password.length > 0
                      ? "bg-orange-50/30 border-orange-200"
                      : ""
                  }`}
                />
                <div
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    focusedField === "password"
                      ? "text-indigo-500"
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
              </div>
              {password.length > 0 && (
                <div
                  className={`text-xs transition-all duration-300 ${
                    password.length >= 6 ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {password.length >= 6
                    ? "✓ Password is strong enough"
                    : `Need ${6 - password.length} more characters`}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className={`w-full h-12 text-lg font-semibold relative overflow-hidden group transition-all duration-300 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 hover:shadow-xl active:scale-95"
              }`}
              disabled={loading}
            >
              <span
                className={`transition-all duration-300 ${
                  loading ? "opacity-0" : "opacity-100"
                }`}
              >
                Create Account
              </span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                </div>
              )}
              {!loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800 transition-all duration-200 underline underline-offset-4 decoration-blue-500 hover:decoration-blue-700 group"
              >
                Click here to log in
                <svg
                  className="w-4 h-4 ml-1 transition-transform duration-200 transform group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8l-4 4m0 0l4 4m-4-4h18"
                  />
                </svg>
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
            transform: translateY(-10px) rotate(1deg);
          }
          66% {
            transform: translateY(5px) rotate(-1deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animation-delay-150 {
          animation-delay: 0.15s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
