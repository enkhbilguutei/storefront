import { Resend } from "resend";
import { render } from "@react-email/render";
import { OrderPlacedEmail } from "../../emails/OrderPlaced";
import { OrderConfirmedEmail } from "../../emails/OrderConfirmed";
import { OrderShippedEmail } from "../../emails/OrderShipped";
import { Logger } from "@medusajs/framework/types";

type InjectedDependencies = {
  logger: Logger;
};

export default class EmailNotificationService {
  private resend: Resend;
  private logger: Logger;

  constructor({ logger }: InjectedDependencies) {
    this.logger = logger;
    // Use the provided API key or fallback to env var
    this.resend = new Resend(process.env.RESEND_API_KEY || "re_9zAKhCiC_FYKddvzAJf9MJW8mEpSUcXYg");
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
        from: "Alimhan <onboarding@resend.dev>", // Update this with verified domain later
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
        from: "Alimhan <onboarding@resend.dev>",
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
        from: "Alimhan <onboarding@resend.dev>",
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
}
