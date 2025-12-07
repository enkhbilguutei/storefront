"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export function RegisterForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterInput>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterInput | "root", string>>
  >({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof RegisterInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validate with Zod
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof RegisterInput] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Register with Medusa backend
      const registerResponse = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/auth/customer/emailpass/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            first_name: formData.firstName,
            last_name: formData.lastName,
          }),
        }
      );

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json().catch(() => ({}));
        if (
          registerResponse.status === 400 &&
          errorData.message?.includes("exists")
        ) {
          setErrors({ root: "Энэ имэйл хаягаар бүртгэл үүссэн байна" });
        } else {
          setErrors({ root: "Бүртгэл үүсгэхэд алдаа гарлаа" });
        }
        setIsLoading(false);
        return;
      }

      // Auto-login after registration
      const signInResponse = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResponse?.error) {
        // Registration successful but auto-login failed, redirect to login
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login?registered=true");
        }, 1500);
        return;
      }

      if (signInResponse?.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 500);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ root: "Алдаа гарлаа. Дахин оролдоно уу." });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo/Brand */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Бүртгүүлэх</h1>
        <p className="text-secondary mt-2">Шинэ бүртгэл үүсгэх</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          <p className="text-sm text-green-600">Амжилттай бүртгэгдлээ!</p>
        </div>
      )}

      {/* Registration Form */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Root Error */}
          {errors.root && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{errors.root}</p>
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Нэр
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-3.5 border rounded-2xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.firstName
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                      : "border-gray-200 focus:ring-foreground/10 focus:border-foreground"
                  }`}
                  placeholder="Бат"
                />
              </div>
              {errors.firstName && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Овог
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-3.5 border rounded-2xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.lastName
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                      : "border-gray-200 focus:ring-foreground/10 focus:border-foreground"
                  }`}
                  placeholder="Болд"
                />
              </div>
              {errors.lastName && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground mb-2"
            >
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
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Нууц үг
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.password}
              </p>
            )}
            <p className="mt-2 text-xs text-secondary">
              Хамгийн багадаа 8 тэмдэгт байх ёстой
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Нууц үг давтах
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full pl-12 pr-12 py-3.5 border rounded-2xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.confirmPassword
                    ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                    : "border-gray-200 focus:ring-foreground/10 focus:border-foreground"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms */}
          <p className="text-xs text-secondary">
            Бүртгүүлснээр та манай{" "}
            <Link href="/terms" className="text-accent hover:underline">
              Үйлчилгээний нөхцөл
            </Link>{" "}
            болон{" "}
            <Link href="/privacy" className="text-accent hover:underline">
              Нууцлалын бодлого
            </Link>
            -г зөвшөөрч байна.
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full py-4 bg-foreground text-white font-medium rounded-2xl hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Бүртгэж байна...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Амжилттай!
              </>
            ) : (
              "Бүртгүүлэх"
            )}
          </button>
        </form>
      </div>

      {/* Login Link */}
      <p className="mt-8 text-center text-sm text-secondary">
        Бүртгэлтэй юу?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-foreground hover:underline"
        >
          Нэвтрэх
        </Link>
      </p>
    </div>
  );
}
