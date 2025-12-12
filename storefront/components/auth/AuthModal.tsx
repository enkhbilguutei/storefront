"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUIStore } from "@/lib/store";
import { API_URL } from "@/lib/config/api";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/validations";
import { getAuthActionMessage, type AuthAction } from "@/lib/auth";
import { 
  X, Eye, EyeOff, Loader2, Mail, Lock, User, 
  AlertCircle, CheckCircle2, ShoppingBag, Heart, 
  Star, MapPin, Package, UserCircle 
} from "lucide-react";

const actionIcons: Record<AuthAction, React.ReactNode> = {
  checkout: <ShoppingBag className="h-6 w-6" />,
  wishlist: <Heart className="h-6 w-6" />,
  review: <Star className="h-6 w-6" />,
  address: <MapPin className="h-6 w-6" />,
  order: <Package className="h-6 w-6" />,
  profile: <UserCircle className="h-6 w-6" />,
};

export function AuthModal() {
  const router = useRouter();
  const { 
    isAuthModalOpen, 
    authModalAction, 
    authModalView, 
    closeAuthModal, 
    setAuthModalView 
  } = useUIStore();
  
  const modalRef = useRef<HTMLDivElement>(null);

  // Form states
  const [loginData, setLoginData] = useState<LoginInput>({ email: "", password: "" });
  const [registerData, setRegisterData] = useState<RegisterInput>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens/closes or view changes
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAuthModalOpen]);

  // Reset forms when view changes - use key pattern instead
  const resetForms = () => {
    setLoginData({ email: "", password: "" });
    setRegisterData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
    setSuccess(false);
  };

  // Reset when modal closes
  const handleClose = () => {
    resetForms();
    closeAuthModal();
  };

  // Reset when switching views
  const handleViewChange = (view: "login" | "register") => {
    resetForms();
    setAuthModalView(view);
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeAuthModal();
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await signIn("credentials", {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      });

      if (response?.error) {
        setErrors({ root: "Имэйл эсвэл нууц үг буруу байна" });
        setIsLoading(false);
        return;
      }

      if (response?.ok) {
        setSuccess(true);
        setTimeout(() => {
          closeAuthModal();
          router.refresh();
        }, 500);
      }
    } catch {
      setErrors({ root: "Алдаа гарлаа. Дахин оролдоно уу." });
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const result = registerSchema.safeParse(registerData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const registerResponse = await fetch(
        `${API_URL}/auth/customer/emailpass/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: registerData.email,
            password: registerData.password,
          }),
        }
      );

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json().catch(() => ({}));
        if (registerResponse.status === 400 && errorData.message?.includes("exists")) {
          setErrors({ root: "Энэ имэйл хаягаар бүртгэл үүссэн байна" });
        } else {
          setErrors({ root: "Бүртгэл үүсгэхэд алдаа гарлаа" });
        }
        setIsLoading(false);
        return;
      }

      const regData = await registerResponse.json();

      if (regData.token) {
        await fetch(
          `${API_URL}/store/customers`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${regData.token}`,
            },
            body: JSON.stringify({
              first_name: registerData.firstName,
              last_name: registerData.lastName,
            }),
          }
        );
      }

      const signInResponse = await signIn("credentials", {
        email: registerData.email,
        password: registerData.password,
        redirect: false,
      });

      if (signInResponse?.ok) {
        setSuccess(true);
        setTimeout(() => {
          closeAuthModal();
          router.refresh();
        }, 500);
      }
    } catch {
      setErrors({ root: "Алдаа гарлаа. Дахин оролдоно уу." });
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: window.location.href });
  };

  if (!isAuthModalOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="flex items-center justify-center min-h-full p-4">
        <div 
          ref={modalRef}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 overflow-hidden"
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-secondary hover:text-foreground hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Action Message */}
            {authModalAction && (
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-2xl">
                <div className="p-2 bg-foreground/10 rounded-xl text-foreground">
                  {actionIcons[authModalAction]}
                </div>
                <p className="text-sm font-medium text-foreground">
                  {getAuthActionMessage(authModalAction)}
                </p>
              </div>
            )}

            {/* Title */}
            <h2 className="text-2xl font-bold text-foreground text-center">
              {authModalView === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
            </h2>
            <p className="text-secondary text-center mt-1">
              {authModalView === "login" 
                ? "Бүртгэлдээ нэвтрэх" 
                : "Шинэ бүртгэл үүсгэх"}
            </p>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <p className="text-sm text-green-600">
                  {authModalView === "login" ? "Амжилттай нэвтэрлээ!" : "Амжилттай бүртгэгдлээ!"}
                </p>
              </div>
            )}

            {/* Social Login */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-2xl text-foreground font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google-ээр {authModalView === "login" ? "нэвтрэх" : "бүртгүүлэх"}
            </button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-secondary">эсвэл</span>
              </div>
            </div>

            {/* Login Form */}
            {authModalView === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {errors.root && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-600">{errors.root}</p>
                  </div>
                )}

                <div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={loginData.email}
                      onChange={handleLoginChange}
                      disabled={isLoading}
                      className={`w-full pl-12 pr-4 py-3 border rounded-2xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.email 
                          ? "border-red-300 focus:ring-red-500/20" 
                          : "border-gray-200 focus:ring-foreground/10"
                      }`}
                      placeholder="Имэйл хаяг"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={loginData.password}
                      onChange={handleLoginChange}
                      disabled={isLoading}
                      className={`w-full pl-12 pr-12 py-3 border rounded-2xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.password 
                          ? "border-red-300 focus:ring-red-500/20" 
                          : "border-gray-200 focus:ring-foreground/10"
                      }`}
                      placeholder="Нууц үг"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Link 
                    href="/auth/forgot-password" 
                    onClick={closeAuthModal}
                    className="text-sm text-accent hover:underline"
                  >
                    Нууц үгээ мартсан?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || success}
                  className="w-full py-3.5 bg-foreground text-white font-medium rounded-2xl hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            )}

            {/* Register Form */}
            {authModalView === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {errors.root && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-600">{errors.root}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                      <input
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={registerData.firstName}
                        onChange={handleRegisterChange}
                        disabled={isLoading}
                        className={`w-full pl-12 pr-4 py-3 border rounded-2xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                          errors.firstName 
                            ? "border-red-300 focus:ring-red-500/20" 
                            : "border-gray-200 focus:ring-foreground/10"
                        }`}
                        placeholder="Нэр"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                      <input
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={registerData.lastName}
                        onChange={handleRegisterChange}
                        disabled={isLoading}
                        className={`w-full pl-12 pr-4 py-3 border rounded-2xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                          errors.lastName 
                            ? "border-red-300 focus:ring-red-500/20" 
                            : "border-gray-200 focus:ring-foreground/10"
                        }`}
                        placeholder="Овог"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                      className={`w-full pl-12 pr-4 py-3 border rounded-2xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.email 
                          ? "border-red-300 focus:ring-red-500/20" 
                          : "border-gray-200 focus:ring-foreground/10"
                      }`}
                      placeholder="Имэйл хаяг"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                      className={`w-full pl-12 pr-12 py-3 border rounded-2xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.password 
                          ? "border-red-300 focus:ring-red-500/20" 
                          : "border-gray-200 focus:ring-foreground/10"
                      }`}
                      placeholder="Нууц үг (8+ тэмдэгт)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      disabled={isLoading}
                      className={`w-full pl-12 pr-12 py-3 border rounded-2xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.confirmPassword 
                          ? "border-red-300 focus:ring-red-500/20" 
                          : "border-gray-200 focus:ring-foreground/10"
                      }`}
                      placeholder="Нууц үг давтах"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || success}
                  className="w-full py-3.5 bg-foreground text-white font-medium rounded-2xl hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            )}

            {/* Toggle View */}
            <p className="mt-5 text-center text-sm text-secondary">
              {authModalView === "login" ? (
                <>
                  Бүртгэл байхгүй юу?{" "}
                  <button
                    onClick={() => handleViewChange("register")}
                    className="font-medium text-foreground hover:underline"
                  >
                    Бүртгүүлэх
                  </button>
                </>
              ) : (
                <>
                  Бүртгэлтэй юу?{" "}
                  <button
                    onClick={() => handleViewChange("login")}
                    className="font-medium text-foreground hover:underline"
                  >
                    Нэвтрэх
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
