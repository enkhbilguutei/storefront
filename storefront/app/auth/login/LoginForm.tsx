"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");
  
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput | "root", string>>>({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof LoginInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validate with Zod
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginInput, string>> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof LoginInput] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (response?.error) {
        setErrors({ root: "Имэйл эсвэл нууц үг буруу байна" });
        setIsLoading(false);
        return;
      }

      if (response?.ok) {
        setSuccess(true);
        // Small delay to show success state
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 500);
      }
    } catch {
      setErrors({ root: "Алдаа гарлаа. Дахин оролдоно уу." });
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo/Brand */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Тавтай морил</h1>
        <p className="text-secondary mt-2">Бүртгэлдээ нэвтрэх</p>
      </div>

      {/* Error from URL params (e.g., OAuth errors) */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">
            {error === "OAuthSignin" && "OAuth нэвтрэлтийн алдаа"}
            {error === "OAuthCallback" && "OAuth callback алдаа"}
            {error === "OAuthCreateAccount" && "Бүртгэл үүсгэхэд алдаа гарлаа"}
            {error === "Callback" && "Callback алдаа"}
            {error === "CredentialsSignin" && "Имэйл эсвэл нууц үг буруу байна"}
            {!["OAuthSignin", "OAuthCallback", "OAuthCreateAccount", "Callback", "CredentialsSignin"].includes(error) && "Нэвтрэхэд алдаа гарлаа"}
          </p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          <p className="text-sm text-green-600">Амжилттай нэвтэрлээ!</p>
        </div>
      )}

      {/* Login Form */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        {/* Social Login */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-gray-200 rounded-2xl text-foreground font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google-ээр нэвтрэх
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-secondary">эсвэл</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Root Error */}
          {errors.root && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{errors.root}</p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Имэйл
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full pl-12 pr-4 py-3.5 border rounded-2xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.email 
                    ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" 
                    : "border-gray-200 focus:ring-foreground/10 focus:border-foreground"
                }`}
                placeholder="tanii@email.com"
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Нууц үг
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full pl-12 pr-12 py-3.5 border rounded-2xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.password 
                    ? "border-red-300 focus:ring-red-500/20 focus:border-red-500" 
                    : "border-gray-200 focus:ring-foreground/10 focus:border-foreground"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-foreground focus:ring-foreground/20" 
              />
              <span className="text-sm text-secondary">Намайг сана</span>
            </label>
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-accent hover:underline"
            >
              Нууц үгээ мартсан?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full py-4 bg-foreground text-white font-medium rounded-2xl hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Нэвтэрч байна...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Амжилттай!
              </>
            ) : (
              "Нэвтрэх"
            )}
          </button>
        </form>
      </div>

      {/* Register Link */}
      <p className="mt-8 text-center text-sm text-secondary">
        Бүртгэл байхгүй юу?{" "}
        <Link href="/auth/register" className="font-medium text-foreground hover:underline">
          Бүртгүүлэх
        </Link>
      </p>
    </div>
  );
}
