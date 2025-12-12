import { Resend } from "resend";
import { render } from "@react-email/render";
import { OrderPlacedEmail } from "../../emails/OrderPlaced";
import { OrderConfirmedEmail } from "../../emails/OrderConfirmed";
import { OrderShippedEmail } from "../../emails/OrderShipped";
import { AbandonedCartEmail } from "../../emails/AbandonedCart";
import { Logger } from "@medusajs/framework/types";

type InjectedDependencies = {
  logger: Logger;
};

export default class EmailNotificationService {
  private resend: Resend;
  private logger: Logger;
  private emailFrom: string;

  constructor({ logger }: InjectedDependencies) {
    this.logger = logger;
    // Only use environment variable for API key (no hardcoded fallback)
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is required");
    }
    this.resend = new Resend(apiKey);
    this.emailFrom = process.env.EMAIL_FROM_ADDRESS || "Alimhan <noreply@alimhan.mn>";
  }

  private formatCurrency(amount: number) {
    return new Intl.NumberFormat("mn-MN", {
      style: "currency",
      currency: "MNT",
    }).format(amount);
  }

  async sendOrderPlaced(order: any) {
    try {
      const customerName = `${order.shipping_address?.first_name || ""} ${order.shipping_address?.last_name || ""}`.trim() || "Харилцагч";
      const email = order.email;
      const items = order.items.map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
        price: this.formatCurrency(item.unit_price),
        thumbnail: item.thumbnail || item.variant?.product?.thumbnail,
      }));
      const totalAmount = this.formatCurrency(order.total);

      const emailHtml = await render(
        OrderPlacedEmail({
          orderId: order.display_id,
          customerName,
          totalAmount,
          items,
        })
      );

      const { data, error } = await this.resend.emails.send({
        from: this.emailFrom,
        to: [email],
        subject: `Захиалга хүлээж авлаа - #${order.display_id}`,
        html: emailHtml,
      });

      if (error) {
        this.logger.error(`Failed to send order placed email: ${error.message}`);
        return;
      }

      this.logger.info(`Order placed email sent to ${email} for order #${order.display_id}. ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Error sending order placed email: ${error}`);
    }
  }

  async sendOrderConfirmed(order: any) {
    try {
      const customerName = `${order.shipping_address?.first_name || ""} ${order.shipping_address?.last_name || ""}`.trim() || "Харилцагч";
      const email = order.email;
      const items = order.items.map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
        price: this.formatCurrency(item.unit_price),
        thumbnail: item.thumbnail || item.variant?.product?.thumbnail,
      }));
      const totalAmount = this.formatCurrency(order.total);

      const emailHtml = await render(
        OrderConfirmedEmail({
          orderId: order.display_id,
          customerName,
          totalAmount,
          items,
        })
      );

      const { data, error } = await this.resend.emails.send({
        from: this.emailFrom,
        to: [email],
        subject: `Захиалга баталгаажлаа - #${order.display_id}`,
        html: emailHtml,
      });

      if (error) {
        this.logger.error(`Failed to send order confirmed email: ${error.message}`);
        return;
      }

      this.logger.info(`Order confirmed email sent to ${email} for order #${order.display_id}. ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Error sending order confirmed email: ${error}`);
    }
  }

  async sendOrderShipped(order: any, fulfillment: any) {
    try {
      const customerName = `${order.shipping_address?.first_name || ""} ${order.shipping_address?.last_name || ""}`.trim() || "Харилцагч";
      const email = order.email;
      
      const items = fulfillment.items.map((fItem: any) => {
        const lineItem = order.items.find((i: any) => i.id === fItem.line_item_id);
        return {
          title: lineItem?.title || "Бүтээгдэхүүн",
          quantity: fItem.quantity,
          thumbnail: lineItem?.thumbnail || lineItem?.variant?.product?.thumbnail,
        };
      });

      const emailHtml = await render(
        OrderShippedEmail({
          orderId: order.display_id,
          customerName,
          items,
        })
      );

      const { data, error } = await this.resend.emails.send({
        from: this.emailFrom,
        to: [email],
        subject: `Захиалга хүргэлтэнд гарлаа - #${order.display_id}`,
        html: emailHtml,
      });

      if (error) {
        this.logger.error(`Failed to send order shipped email: ${error.message}`);
        return;
      }

      this.logger.info(`Order shipped email sent to ${email} for order #${order.display_id}. ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Error sending order shipped email: ${error}`);
    }
  }

  async sendAbandonedCartEmail(cart: any, discountCode?: string) {
    try {
      const email = cart.email;
      if (!email) {
        this.logger.warn(`Cannot send abandoned cart email: cart ${cart.id} has no email`);
        return;
      }

      const items = cart.items.map((item: any) => ({
        title: item.title || item.product_title,
        quantity: item.quantity,
        price: this.formatCurrency(item.unit_price || 0),
        thumbnail: item.thumbnail,
      }));
      
      const subtotal = this.formatCurrency(cart.subtotal || 0);
      const storefrontUrl = process.env.STORE_URL || "https://alimhan.mn";
      const cartUrl = `${storefrontUrl}/cart`;

      const emailHtml = await render(
        AbandonedCartEmail({
          cartId: cart.id,
          customerEmail: email,
          items,
          subtotal,
          cartUrl,
          discountCode: discountCode || "CART10",
        })
      );

      const { data, error } = await this.resend.emails.send({
        from: this.emailFrom,
        to: [email],
        subject: "Таны сагсанд бүтээгдэхүүн үлдсэн байна 🛒",
        html: emailHtml,
      });

      if (error) {
        this.logger.error(`Failed to send abandoned cart email: ${error.message}`);
        return;
      }

      this.logger.info(`Abandoned cart email sent to ${email} for cart ${cart.id}. ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Error sending abandoned cart email: ${error}`);
    }
  }
}
