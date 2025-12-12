"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Trophy, TrendingUp, Gift, Calendar, ChevronRight, Loader2, Crown } from "lucide-react";
import { API_URL, API_KEY } from "@/lib/config/api";

interface SessionWithToken {
  accessToken?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface LoyaltyAccount {
  id: string;
  customer_id: string;
  points_balance: number;
  total_earned: number;
  total_redeemed: number;
  tier: string;
  birthday?: string;
  created_at: string;
  updated_at: string;
}

interface TierInfo {
  currentTier: {
    tier: string;
    name: string;
    minPoints: number;
    discountPercent: number;
    color: string;
    benefits: string[];
  };
  nextTier: {
    tier: string;
    name: string;
    minPoints: number;
    discountPercent: number;
    color: string;
    benefits: string[];
  } | null;
  pointsToNextTier: number;
  progressPercent: number;
}

interface Transaction {
  id: string;
  points: number;
  type: string;
  reason: string;
  created_at: string;
  order_id?: string;
}

export default function LoyaltyPage() {
  const { data: session } = useSession();
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if ((session as SessionWithToken)?.accessToken) {
      fetchLoyaltyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchLoyaltyData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const token = (session as SessionWithToken)?.accessToken;
      
      // Fetch account and tier info
      const accountRes = await fetch(`${API_URL}/store/loyalty/account`, {
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!accountRes.ok) {
        const errorData = await accountRes.text();
        throw new Error(`Failed to fetch loyalty account: ${accountRes.status} - ${errorData}`);
      }

      const accountData = await accountRes.json();
      setAccount(accountData.account);
      setTierInfo(accountData.tierInfo);

      // Fetch transactions
      const transactionsRes = await fetch(`${API_URL}/store/loyalty/transactions?take=10`, {
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions);
      }
    } catch (err) {
      console.error("Error fetching loyalty data:", err);
      setError("Урьдчилан уучлаарай, өгөгдөл татахад алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("mn-MN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("mn-MN").format(num);
  };

  const getTierIcon = (tier: string, sizeClass = "w-6 h-6") => {
    switch (tier) {
      case "gold":
        return <Crown className={`${sizeClass} text-amber-600`} />;
      case "silver":
        return <Trophy className={`${sizeClass} text-gray-500`} />;
      default:
        return <Trophy className={`${sizeClass} text-amber-700`} />;
    }
  };

  const getTierBadgeClasses = (tier: string) => {
    switch (tier) {
      case "gold":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "silver":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-amber-50 text-amber-800 border-amber-200";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 p-6">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <p className="text-sm text-secondary mt-3">Урамшууллын мэдээлэл татаж байна...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Gift className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchLoyaltyData()}
            className="text-sm text-foreground underline underline-offset-4 hover:no-underline"
          >
            Дахин оролдох
          </button>
        </div>
      </div>
    );
  }

  if (!account || !tierInfo) {
    return (
      <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-sm text-secondary">Өгөгдөл олдсонгүй</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">Урамшууллын програм</h1>
            <p className="text-sm text-secondary mt-1">
              Худалдан авалт бүрээс оноо цуглуулж, хөнгөлөлт эдлээрэй
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${getTierBadgeClasses(
              tierInfo.currentTier.tier
            )}`}
          >
            {getTierIcon(tierInfo.currentTier.tier, "w-4 h-4")}
            {tierInfo.currentTier.name}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Balance */}
          <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  {getTierIcon(tierInfo.currentTier.tier, "w-5 h-5")}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-secondary">Таны оноо</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                    {formatNumber(account.points_balance)}
                  </p>
                </div>
              </div>

              {tierInfo.currentTier.discountPercent > 0 ? (
                <div className="shrink-0 text-right">
                  <p className="text-xs text-secondary">Байнгын хөнгөлөлт</p>
                  <p className="text-sm font-semibold text-foreground">
                    {tierInfo.currentTier.discountPercent}%
                  </p>
                </div>
              ) : (
                <div className="shrink-0 text-right">
                  <p className="text-xs text-secondary">Байнгын хөнгөлөлт</p>
                  <p className="text-sm font-semibold text-foreground">-</p>
                </div>
              )}
            </div>

            {tierInfo.nextTier ? (
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-sm text-secondary">
                    <span className="font-medium text-foreground">{tierInfo.nextTier.name}</span> зэрэглэл хүртэл
                  </p>
                  <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                    {formatNumber(tierInfo.pointsToNextTier)} оноо
                  </p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-foreground rounded-full h-2 transition-all duration-500"
                    style={{ width: `${Math.min(tierInfo.progressPercent, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-secondary mt-2">
                  1₮ = 1 оноо (Алт зэрэглэлд 1.5x)
                </p>
              </div>
            ) : (
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <Crown className="h-4 w-4 text-foreground" />
                  Та хамгийн дээд зэрэглэлд байна
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-secondary">Нийт цуглуулсан</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatNumber(account.total_earned)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <Gift className="h-5 w-5 text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-secondary">Ашигласан оноо</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatNumber(account.total_redeemed)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 p-4 sm:p-5 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Оноо хөдөлгөөний түүх</h2>
                <p className="text-xs text-secondary">Сүүлийн 10 хөдөлгөөн</p>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-sm text-secondary">Одоогоор түүх байхгүй байна</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.map((transaction) => {
                  const title =
                    transaction.type === "earn"
                      ? "Оноо цуглуулсан"
                      : transaction.type === "redeem"
                        ? "Оноо ашигласан"
                        : "Засвар";
                  const pointsColor =
                    transaction.points > 0 ? "text-emerald-600" : "text-red-600";

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between gap-4 p-4 sm:p-5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{title}</p>
                        <p className="text-xs text-secondary mt-1">{formatDate(transaction.created_at)}</p>
                        {transaction.reason ? (
                          <p className="text-xs text-secondary mt-1 wrap-break-word">{transaction.reason}</p>
                        ) : null}
                      </div>

                      <div className="shrink-0 text-right">
                        <p className={`text-base font-semibold ${pointsColor}`}>
                          {transaction.points > 0 ? "+" : ""}
                          {formatNumber(transaction.points)}
                        </p>
                        <p className="text-xs text-secondary">оноо</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 md:space-y-6">
          {/* Current Tier Benefits */}
          <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                {getTierIcon(tierInfo.currentTier.tier, "w-5 h-5")}
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">{tierInfo.currentTier.name} давуу тал</h2>
                <p className="text-xs text-secondary">Таны одоогийн боломжууд</p>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <ul className="space-y-3">
                {tierInfo.currentTier.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <ChevronRight className="w-3 h-3 text-gray-600" />
                    </div>
                    <span className="text-sm text-foreground/90">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Next Tier */}
          {tierInfo.nextTier && (
            <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  {getTierIcon(tierInfo.nextTier.tier, "w-5 h-5")}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">{tierInfo.nextTier.name} давуу тал</h2>
                  <p className="text-xs text-secondary">Дараагийн шатанд очих</p>
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <ul className="space-y-3">
                  {tierInfo.nextTier.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                        <ChevronRight className="w-3 h-3 text-gray-600" />
                      </div>
                      <span className="text-sm text-foreground/90">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* How it Works */}
          <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 p-4 sm:p-5">
            <h2 className="text-base font-semibold text-foreground">Хэрхэн ажилладаг вэ?</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-secondary">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">1.</span>
                <span>Худалдан авалт бүрээс оноо цуглуулна (1₮ = 1 оноо)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">2.</span>
                <span>Онооны дүнгээр автоматаар зэрэглэл дээшилнэ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">3.</span>
                <span>Өндөр зэрэглэл = Илүү хөнгөлөлт ба давуу тал</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">4.</span>
                <span>Алт зэрэглэлд илүү олон оноо цуглуулах боломжтой</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
