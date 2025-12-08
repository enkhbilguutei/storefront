import EmailNotificationService from "./service";
import { Module } from "@medusajs/framework/utils";

export const EMAIL_NOTIFICATION_MODULE = "emailNotification";

export default Module(EMAIL_NOTIFICATION_MODULE, {
  service: EmailNotificationService,
});
