import { MedusaService } from "@medusajs/framework/utils"
import { LoyaltyAccount, LoyaltyTransaction } from "./models/loyalty"
import { LoyaltyTiers, TierConfig, TransactionType, type LoyaltyTierType } from "./models/loyalty"

class LoyaltyModuleService extends MedusaService({
  LoyaltyAccount,
  LoyaltyTransaction,
}) {
  /**
   * Get or create loyalty account for a customer
   */
  async getOrCreateAccount(customerId: string) {
    let [account] = await this.listLoyaltyAccounts({
      customer_id: customerId,
    })

    if (!account) {
      account = await this.createLoyaltyAccounts({
        customer_id: customerId,
        points_balance: 0,
        total_earned: 0,
        total_redeemed: 0,
        tier: LoyaltyTiers.BRONZE,
      })
    }

    return account
  }

  /**
   * Award points to a customer
   * Automatically updates tier based on total earned points
   */
  async awardPoints(
    customerId: string,
    points: number,
    options: {
      reason?: string
      order_id?: string
      metadata?: Record<string, any>
    } = {}
  ) {
    const account = await this.getOrCreateAccount(customerId)

    if (options.order_id) {
      const existing = await this.listLoyaltyTransactions(
        {
          loyalty_account_id: account.id,
          order_id: options.order_id,
          type: TransactionType.EARN,
        },
        {
          take: 1,
        }
      )

      if (existing.length) {
        return {
          account: await this.retrieveLoyaltyAccount(account.id),
          tierUpgraded: false,
          alreadyProcessed: true,
        }
      }
    }

    // Create transaction
    await this.createLoyaltyTransactions({
      loyalty_account_id: account.id,
      points,
      type: TransactionType.EARN,
      reason: options.reason || "purchase",
      order_id: options.order_id || null,
      metadata: options.metadata || null,
    })

    // Update account
    const newBalance = account.points_balance + points
    const newTotalEarned = account.total_earned + points

    // Calculate new tier based on total earned
    const newTier = this.calculateTier(newTotalEarned)

    await this.updateLoyaltyAccounts({
      id: account.id,
      points_balance: newBalance,
      total_earned: newTotalEarned,
      tier: newTier,
    })

    return {
      account: await this.retrieveLoyaltyAccount(account.id),
      tierUpgraded: newTier !== account.tier,
    }
  }

  /**
   * Redeem points from a customer account
   */
  async redeemPoints(
    customerId: string,
    points: number,
    options: {
      reason?: string
      order_id?: string
      metadata?: Record<string, any>
    } = {}
  ) {
    const account = await this.getOrCreateAccount(customerId)

    if (account.points_balance < points) {
      throw new Error(`Insufficient points. Available: ${account.points_balance}, Required: ${points}`)
    }

    // Create transaction
    await this.createLoyaltyTransactions({
      loyalty_account_id: account.id,
      points: -points,
      type: TransactionType.REDEEM,
      reason: options.reason || "redemption",
      order_id: options.order_id || null,
      metadata: options.metadata || null,
    })

    // Update account
    const newBalance = account.points_balance - points
    const newTotalRedeemed = account.total_redeemed + points

    await this.updateLoyaltyAccounts({
      id: account.id,
      points_balance: newBalance,
      total_redeemed: newTotalRedeemed,
    })

    return await this.retrieveLoyaltyAccount(account.id)
  }

  /**
   * Calculate tier based on total earned points
   */
  calculateTier(totalEarnedPoints: number): LoyaltyTierType {
    if (totalEarnedPoints >= TierConfig.gold.minPoints) {
      return LoyaltyTiers.GOLD
    } else if (totalEarnedPoints >= TierConfig.silver.minPoints) {
      return LoyaltyTiers.SILVER
    }
    return LoyaltyTiers.BRONZE
  }

  /**
   * Calculate points to award for a given amount (in MNT)
   * Gold tier gets 1.5x multiplier, Platinum gets 2x
   */
  calculatePointsForAmount(amount: number, tier: LoyaltyTierType): number {
    // Base: 1 point per 1 MNT (1₮ = 1 point)
    let points = Math.floor(amount)

    // Apply tier multiplier
    if (tier === LoyaltyTiers.GOLD) {
      points = Math.floor(points * 1.5)
    }

    return Math.max(0, points)
  }

  /**
   * Get transaction history for an account
   */
  async getAccountTransactions(
    customerId: string,
    options?: {
      skip?: number
      take?: number
    }
  ) {
    const account = await this.getOrCreateAccount(customerId)

    const transactions = await this.listLoyaltyTransactions(
      {
        loyalty_account_id: account.id,
      },
      {
        skip: options?.skip || 0,
        take: options?.take || 50,
        order: { created_at: "DESC" },
      }
    )

    return transactions
  }

  /**
   * Get tier configuration and progress
   */
  getTierInfo(account: any) {
    const currentTier = account.tier as LoyaltyTierType
    const currentConfig = TierConfig[currentTier]
    
    // Find next tier
    const allTiers = Object.entries(TierConfig).sort(
      ([, a], [, b]) => a.minPoints - b.minPoints
    )
    const currentIndex = allTiers.findIndex(([key]) => key === currentTier)
    const nextTierEntry = allTiers[currentIndex + 1]
    
    let nextTier: any = null
    let pointsToNextTier = 0
    let progressPercent = 100
    
    if (nextTierEntry) {
      const [nextTierKey, nextTierConfig] = nextTierEntry
      nextTier = {
        tier: nextTierKey,
        ...nextTierConfig,
      }
      pointsToNextTier = Math.max(0, nextTierConfig.minPoints - account.total_earned)
      progressPercent = Math.min(
        100,
        (account.total_earned / nextTierConfig.minPoints) * 100
      )
    }

    return {
      currentTier: {
        tier: currentTier,
        ...currentConfig,
      },
      nextTier,
      pointsToNextTier,
      progressPercent,
    }
  }

  /**
   * Update birthday for an account
   */
  async updateBirthday(customerId: string, birthday: Date) {
    const account = await this.getOrCreateAccount(customerId)
    
    await this.updateLoyaltyAccounts({
      id: account.id,
      birthday,
    })
    
    return await this.retrieveLoyaltyAccount(account.id)
  }

  /**
   * Check if customer is eligible for birthday reward
   * Returns true if birthday is this month and reward not sent this year
   */
  async isBirthdayRewardEligible(customerId: string): Promise<boolean> {
    const account = await this.getOrCreateAccount(customerId)
    
    if (!account.birthday) {
      return false
    }
    
    const birthday = new Date(account.birthday)
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    // Check if birthday is this month
    if (birthday.getMonth() !== currentMonth) {
      return false
    }
    
    // Check if reward already sent this year
    if (account.birthday_reward_sent_year === currentYear) {
      return false
    }
    
    return true
  }

  /**
   * Mark birthday reward as sent for current year
   */
  async markBirthdayRewardSent(customerId: string) {
    const account = await this.getOrCreateAccount(customerId)
    const currentYear = new Date().getFullYear()
    
    await this.updateLoyaltyAccounts({
      id: account.id,
      birthday_reward_sent_year: currentYear,
    })
  }
}

export default LoyaltyModuleService
