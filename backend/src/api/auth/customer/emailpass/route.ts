import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import jwt from "jsonwebtoken";
import { validateBody, emailPasswordSchema, formatValidationErrors } from "../../../validations";
import { rateLimiters } from "../../../middlewares/rate-limit";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  // Apply strict rate limiting for login attempts
  const rateLimitResult = await rateLimiters.strict(req, res);
  if (rateLimitResult) {
    // Rate limit response already sent
    return;
  }

  const validation = validateBody(emailPasswordSchema, req.body);
  
  if (!validation.success) {
    return res.status(400).json({ 
      message: "Validation failed",
      errors: formatValidationErrors(validation.errors)
    });
  }

  const { email, password } = validation.data;

  const authModuleService = req.scope.resolve(Modules.AUTH);
  
  try {
    // Manual authentication using scrypt-kdf to match registration
    const identities = await authModuleService.listAuthIdentities({
      provider_identities: {
        entity_id: email,
        provider: "emailpass"
      }
    }, {
      relations: ["provider_identities"]
    });

    if (identities.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const authIdentity = identities[0] as any;
    
    // Find the emailpass provider identity
    const providerIdentity = authIdentity.provider_identities?.find(
      (p: any) => p.provider === "emailpass"
    );

    if (!providerIdentity) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const storedPasswordHash = providerIdentity.provider_metadata?.password as string;

    if (!storedPasswordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Dynamic import for ESM module
    const scrypt = await import("scrypt-kdf") as any;
    const verifyFn = scrypt.verify || scrypt.default?.verify;

    if (!verifyFn) {
      console.error("Could not find verify function in scrypt-kdf");
      return res.status(500).json({ message: "Internal server error" });
    }

    const hashBuffer = Buffer.from(storedPasswordHash, "base64");
    const isValid = await verifyFn(hashBuffer, password);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET || "supersecret";

    // Generate JWT token
    const customerId = authIdentity.app_metadata?.customer_id as string;

    const token = jwt.sign(
      {
        sub: authIdentity.id,
        actor_id: customerId,
        auth_identity_id: authIdentity.id,
        app_metadata: authIdentity.app_metadata,
        scope: "store",
      },
      secret,
      { expiresIn: "1d" }
    );

    // Fetch customer details to return with token
    let customer;
    if (customerId) {
      try {
        const customerModuleService = req.scope.resolve(Modules.CUSTOMER);
        customer = await customerModuleService.retrieveCustomer(customerId);
      } catch (e) {
        console.error("Failed to fetch customer:", e);
      }
    }

    return res.json({ token, customer });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
