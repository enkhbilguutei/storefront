import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function getApiKey({ container }: ExecArgs) {
  const apiKeyModule = container.resolve(Modules.API_KEY);
  
  const keys = await apiKeyModule.listApiKeys({ type: "publishable" });
  
  console.log("\n=== Publishable API Keys ===");
  keys.forEach(k => {
    console.log(`Title: ${k.title}`);
    console.log(`Token: ${k.token}`);
    console.log("---");
  });
  
  if (keys.length > 0) {
    console.log("\n📋 Update your storefront/.env.local with:");
    console.log(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${keys[0].token}`);
  }
}
