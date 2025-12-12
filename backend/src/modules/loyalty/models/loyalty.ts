import { model } from "@medusajs/framework/utils"

/**
 * Loyalty tier configuration
 * Defines point thresholds and benefits for each tier
 */
export const LoyaltyTiers = {
  BRONZE: "bronze",
  SILVER: "silver",
  GOLD: "gold",
} as const

export type LoyaltyTierType = typeof LoyaltyTiers[keyof typeof LoyaltyTiers]

/**
 * Tier configuration with point thresholds and benefits
 */
export const TierConfig: Record<LoyaltyTierType, {
  name: string
  minPoints: number
  discountPercent: number
  color: string
  benefits: string[]
}> = {
  bronze: {
    name: "Хүрэл",
    minPoints: 0,
    discountPercent: 0,
    color: "#cd7f32",
    benefits: [
      "1₮ = 1 оноо",
      "Онцгой санал хүргэлт",
    ],
  },
  silver: {
    name: "Мөнгө",
    minPoints: 10000,
    discountPercent: 5,
    color: "#c0c0c0",
    benefits: [
      "1₮ = 1 оноо",
      "5% байнгын хөнгөлөлт",
      "Төрсөн өдрийн бэлэг",
      "Түргэн хүргэлт",
    ],
  },
  gold: {
    name: "Алт",
    minPoints: 50000,
    discountPercent: 10,
    color: "#ffd700",
    benefits: [
      "1₮ = 1.5 оноо",
      "10% байнгын хөнгөлөлт",
      "Төрсөн өдрийн бэлэг",
      "Үнэгүй хүргэлт",
      "Түргэн буцаалт",
    ],
  },
}

/**
 * Loyalty account for tracking customer points and tier
 */
const LoyaltyAccount = model.define("loyalty_account", {
  id: model.id().primaryKey(),
  customer_id: model.text().searchable(),
  
  // Points tracking
  points_balance: model.number().default(0),
  total_earned: model.number().default(0),
  total_redeemed: model.number().default(0),
  
  // Tier
  tier: model.text().default("bronze"),
  
  // Birthday for special rewards
  birthday: model.dateTime().nullable(),
  birthday_reward_sent_year: model.number().nullable(),
  
  // Metadata for extensibility
  metadata: model.json().nullable(),
})

/**
 * Transaction type for earning or redeeming points
 */
export const TransactionType = {
  EARN: "earn",
  REDEEM: "redeem",
  ADJUST: "adjust",
} as const

export type TransactionTypeValue = typeof TransactionType[keyof typeof TransactionType]

/**
 * Loyalty transaction for tracking point changes
 */
const LoyaltyTransaction = model.define("loyalty_transaction", {
  id: model.id().primaryKey(),
  loyalty_account_id: model.text().searchable(),
  
  // Transaction details
  points: model.number(),
  type: model.text(), // earn, redeem, adjust
  reason: model.text().nullable(),
  
  // Related entities
  order_id: model.text().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
})

export { LoyaltyAccount, LoyaltyTransaction }
