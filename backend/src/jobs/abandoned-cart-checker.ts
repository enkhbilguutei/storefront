import { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

/**
 * Scheduled job to check for abandoned carts and send recovery emails
 * Runs every 6 hours to find carts that:
 * - Have not been completed (completed_at IS NULL)
 * - Have an email address
 * - Were last updated more than 24 hours ago
 * - Haven't already received an abandoned cart email
 */
export default async function abandonedCartChecker(
  container: MedusaContainer
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const emailService = container.resolve("emailNotification");

  try {
    logger.info("Starting abandoned cart checker job");

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Query abandoned carts using Medusa Query
    const { data: carts } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "email",
        "subtotal",
        "currency_code",
        "updated_at",
        "completed_at",
        "metadata",
        "items.*",
        "items.product_title",
        "items.thumbnail",
      ],
      filters: {
        completed_at: null,
        email: { $ne: null },
        updated_at: { $lt: twentyFourHoursAgo.toISOString() },
      },
    });

    if (!carts || carts.length === 0) {
      logger.info("No abandoned carts found");
      return;
    }

    logger.info(`Found ${carts.length} abandoned carts`);

    let emailsSent = 0;
    let emailsSkipped = 0;

    for (const cart of carts) {
      // Check if we've already sent an abandoned cart email
      if (cart.metadata?.abandoned_email_sent_at) {
        emailsSkipped++;
        continue;
      }

      // Skip if cart has no items
      if (!cart.items || cart.items.length === 0) {
        emailsSkipped++;
        continue;
      }

      // Send abandoned cart email
      await emailService.sendAbandonedCartEmail(cart, "CART10");

      // Update cart metadata to mark email as sent
      // Using cart module to update metadata
      const cartModule = container.resolve(Modules.CART);
      await cartModule.updateCarts(cart.id, {
        metadata: {
          ...cart.metadata,
          abandoned_email_sent_at: new Date().toISOString(),
        },
      });

      emailsSent++;
      logger.info(`Sent abandoned cart email for cart ${cart.id} to ${cart.email}`);
    }

    logger.info(
      `Abandoned cart checker completed: ${emailsSent} emails sent, ${emailsSkipped} skipped`
    );
  } catch (error) {
    logger.error(`Error in abandoned cart checker job: ${error}`);
    throw error;
  }
}

export const config = {
  name: "abandoned-cart-checker",
  // Run every 6 hours: at 00:00, 06:00, 12:00, and 18:00
  schedule: "0 */6 * * *",
};
