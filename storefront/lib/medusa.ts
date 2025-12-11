import Medusa from "@medusajs/js-sdk";
import { API_URL, API_KEY } from "@/lib/config/api";

export const medusa = new Medusa({
  baseUrl: API_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: API_KEY,
});
