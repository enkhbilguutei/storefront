import { ExecArgs } from "@medusajs/framework/types";
import { EMAIL_NOTIFICATION_MODULE } from "../modules/email-notifications";
import EmailNotificationService from "../modules/email-notifications/service";

export default async function({ container }: ExecArgs) {
  const emailService: EmailNotificationService = container.resolve(EMAIL_NOTIFICATION_MODULE);

  // CHANGE THIS: The email address to receive the test emails
  // If using Resend onboarding, this must be the email you signed up with
  const TEST_EMAIL = "framework0211@gmail.com"; 

  const mockOrder = {
    display_id: "TEST-1001",
    email: TEST_EMAIL,
    total: 150000,
    currency_code: "mnt",
    shipping_address: {
      first_name: "Bilguutei",
      last_name: "Test",
    },
    items: [
      {
        id: "item_1",
        title: "Алим (Apple)",
        quantity: 2,
        unit_price: 75000,
        thumbnail: "https://res.cloudinary.com/dppvj3v0h/image/upload/v1733644800/cld-sample-4.jpg", // Sample image
      },
    ],
  };

  const mockFulfillment = {
    items: [
      {
        line_item_id: "item_1", // Mock ID
        quantity: 2,
      }
    ]
  };

  console.log(`🚀 Sending test emails to ${TEST_EMAIL}...`);

  try {
    console.log("1. Sending Order Placed Email...");
    await emailService.sendOrderPlaced(mockOrder);
    console.log("✅ Order Placed Email Sent");

    console.log("2. Sending Order Confirmed Email...");
    await emailService.sendOrderConfirmed(mockOrder);
    console.log("✅ Order Confirmed Email Sent");

    console.log("3. Sending Order Shipped Email...");
    await emailService.sendOrderShipped(mockOrder, mockFulfillment);
    console.log("✅ Order Shipped Email Sent");

    console.log("🎉 All test emails sent successfully!");
  } catch (error) {
    console.error("❌ Error sending emails:", error);
  }
}
