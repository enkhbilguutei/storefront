import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function checkShipping({ container }: ExecArgs) {
  const fulfillmentService = container.resolve(Modules.FULFILLMENT);
  const options = await fulfillmentService.listShippingOptions({});
  console.log("\n=== Shipping Options ===");
  options.forEach((o: any) => {
    console.log(`  - ${o.name} (ID: ${o.id})`);
  });
  console.log(`\nTotal: ${options.length} shipping options`);
}
