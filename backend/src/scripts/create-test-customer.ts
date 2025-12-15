import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createCustomerAccountWorkflow } from "@medusajs/core-flows";

export default async function createTestCustomer({ container }: ExecArgs) {
  const customerModuleService = container.resolve(Modules.CUSTOMER);

  const email = "admin@alimhan.mn";
  const password = "applebyalimhan";

  // Check if customer already exists
  const existingCustomers = await customerModuleService.listCustomers({ email });
  
  if (existingCustomers.length > 0) {
    console.log(`Customer ${email} already exists`);
    return;
  }

  console.log(`Creating customer ${email}...`);

  try {
    // 1. Check/Create Auth Identity
    const authModuleService = container.resolve(Modules.AUTH);
    console.log("Checking auth identity...");
    
    let authIdentity;
    const existingIdentities = await authModuleService.listAuthIdentities({
        provider_identities: {
            entity_id: email,
            provider: "emailpass"
        }
    });

    if (existingIdentities.length > 0) {
        console.log("Auth identity already exists, using it.");
        authIdentity = existingIdentities[0];
    } else {
        console.log("Creating auth identity...");
        // Dynamic import for ESM module
        const scrypt = await import("scrypt-kdf") as any;
        
        const hashFn = scrypt.kdf || scrypt.default?.kdf || scrypt.default;
        
        if (!hashFn) {
          throw new Error("Could not find kdf function in scrypt-kdf");
        }

        const passwordHash = await hashFn(password, { logN: 15, r: 8, p: 1 });
        const passwordHashString = passwordHash.toString("base64");

        authIdentity = await authModuleService.createAuthIdentities({
          provider_identities: [
            {
              provider: "emailpass",
              entity_id: email,
              user_metadata: {
              },
              provider_metadata: {
                password: passwordHashString
              }
            }
          ],
          app_metadata: {
          }
        });
    }
    
    console.log("Auth identity ID:", authIdentity.id);

    // 2. Create Customer using workflow
    console.log("Creating customer...");
    const { result: customer } = await createCustomerAccountWorkflow(container).run({
      input: {
        authIdentityId: authIdentity.id,
        customerData: {
          email,
          first_name: "Admin",
          last_name: "Customer",
        },
      },
    });
    
    console.log(`Customer created successfully: ${customer.id}`);
    
  } catch (e) {
    console.error("Error creating customer:", e);
  }
}
