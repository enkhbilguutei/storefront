"use client";

import { User, Mail, Phone, Check, ChevronDown, ChevronUp, LogIn } from "lucide-react";
import Link from "next/link";

interface ContactStepProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  onFirstNameChange: (firstName: string) => void;
  onLastNameChange: (lastName: string) => void;
  onEmailChange: (email: string) => void;
  onPhoneChange: (phone: string) => void;
  isAuthenticated: boolean;
  userName?: string;
  isExpanded: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  errors?: { firstName?: string; lastName?: string; email?: string; phone?: string };
}

export function ContactStep({
  firstName,
  lastName,
  email,
  phone,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  isAuthenticated,
  userName,
  isExpanded,
  isCompleted,
  onToggle,
  errors,
}: ContactStepProps) {
  // Format phone number for display (8 digits)
  const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "");
    // Limit to 8 digits
    return digits.slice(0, 8);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onPhoneChange(formatted);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isCompleted ? "bg-[#34c759]" : "bg-[#f5f5f7]"
          }`}>
            {isCompleted ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <span className="text-[14px] font-semibold text-[#1d1d1f]">1</span>
            )}
          </div>
          <div className="text-left">
            <h3 className="text-[16px] font-semibold text-[#1d1d1f]">
              Холбоо барих
            </h3>
            {isCompleted && !isExpanded && email && (
              <p className="text-[13px] text-[#86868b] mt-0.5">{email}</p>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[#86868b]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#86868b]" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-4">
          {/* Auth info */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3 p-4 bg-[#f5f5f7] rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[#0071e3] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#1d1d1f]">
                  {userName || "Хэрэглэгч"}
                </p>
                <p className="text-[13px] text-[#86868b]">Нэвтэрсэн</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-[#f5f5f7] rounded-xl">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#86868b]" />
                <span className="text-[14px] text-[#86868b]">
                  Зочин хэрэглэгч
                </span>
              </div>
              <Link
                href="/auth/login?callbackUrl=/checkout"
                className="flex items-center gap-1.5 text-[14px] font-medium text-[#0071e3] hover:underline"
              >
                <LogIn className="w-4 h-4" />
                Нэвтрэх
              </Link>
            </div>
          )}

          {/* Name fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                Овог *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                placeholder="Овог"
                className={`w-full px-4 py-3.5 bg-[#f5f5f7] border rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all ${
                  errors?.lastName ? "border-red-500" : "border-transparent"
                }`}
              />
              {errors?.lastName && (
                <p className="text-red-500 text-[13px] mt-1.5">{errors.lastName}</p>
              )}
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
                Нэр *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                placeholder="Нэр"
                className={`w-full px-4 py-3.5 bg-[#f5f5f7] border rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all ${
                  errors?.firstName ? "border-red-500" : "border-transparent"
                }`}
              />
              {errors?.firstName && (
                <p className="text-red-500 text-[13px] mt-1.5">{errors.firstName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
              И-мэйл хаяг *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868b]" />
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="example@mail.com"
                className={`w-full pl-12 pr-4 py-3.5 bg-[#f5f5f7] border rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all ${
                  errors?.email ? "border-red-500" : "border-transparent"
                }`}
              />
            </div>
            {errors?.email && (
              <p className="text-red-500 text-[13px] mt-1.5">{errors.email}</p>
            )}
            <p className="text-[12px] text-[#86868b] mt-1.5">
              Захиалгын баталгаажуулалт энэ хаягт илгээгдэнэ
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[14px] font-medium text-[#1d1d1f] mb-2">
              Утасны дугаар *
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868b]" />
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="99112233"
                maxLength={8}
                className={`w-full pl-12 pr-4 py-3.5 bg-[#f5f5f7] border rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all ${
                  errors?.phone ? "border-red-500" : "border-transparent"
                }`}
              />
            </div>
            {errors?.phone && (
              <p className="text-red-500 text-[13px] mt-1.5">{errors.phone}</p>
            )}
            <p className="text-[12px] text-[#86868b] mt-1.5">
              8 оронтой Монгол утасны дугаар
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
