import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { createCustomerAccountWorkflow } from "@medusajs/medusa/core-flows";
import jwt from "jsonwebtoken";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { email, password, first_name, last_name } = req.body as any;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const authModuleService = req.scope.resolve(Modules.AUTH);
  
  try {
    // Check if identity exists
    const existingIdentities = await authModuleService.listAuthIdentities({
        provider_identities: {
            entity_id: email,
            provider: "emailpass"
        }
    });

    if (existingIdentities.length > 0) {
        return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    // Dynamic import for ESM module
    const scrypt = await import("scrypt-kdf") as any;
    const hashFn = scrypt.kdf || scrypt.default?.kdf || scrypt.default;
    
    if (!hashFn) {
      throw new Error("Could not find kdf function in scrypt-kdf");
    }

    const passwordHash = await hashFn(password, { logN: 15, r: 8, p: 1 });
    const passwordHashString = passwordHash.toString("base64");

    // Create Auth Identity
    const authIdentity = await authModuleService.createAuthIdentities({
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

    // Create Customer and Link to Auth Identity
    const { result: customer } = await createCustomerAccountWorkflow(req.scope).run({
      input: {
        authIdentityId: authIdentity.id,
        customerData: {
          email,
          first_name: first_name || "",
          last_name: last_name || "",
        },
      },
    });

    // Generate Token with customer_id (actor_id)
    const token = jwt.sign(
      {
        actor_id: customer.id,
        auth_identity_id: authIdentity.id,
        app_metadata: {
          ...authIdentity.app_metadata,
          customer_id: customer.id
        },
        scope: "store",
      },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "1d" }
    );

    return res.json({ token, customer });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
