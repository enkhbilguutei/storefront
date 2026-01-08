import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import jwt from "jsonwebtoken";
import { validateBody, oauthSchema, formatValidationErrors } from "../../../validations";

/**
 * POST /auth/customer/oauth
 * 
 * Creates or retrieves a customer for OAuth providers (Google, etc.)
 * and issues a JWT token for Medusa API access
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const validation = validateBody(oauthSchema, req.body);
  
  if (!validation.success) {
    return res.status(400).json({ 
      message: "Validation failed",
      errors: formatValidationErrors(validation.errors)
    });
  }

  const { email, provider } = validation.data;
  const name = (req.body as any).name;

  try {
    const customerModuleService = req.scope.resolve(Modules.CUSTOMER);

    // Check if customer already exists
    let customers = await customerModuleService.listCustomers({
      email: email,
    });

    let customer;
    if (customers.length > 0) {
      customer = customers[0];
    } else {
      // Create new customer for OAuth user
      const [firstName, ...lastNameParts] = (name || email.split("@")[0]).split(" ");
      const lastName = lastNameParts.join(" ");

      const createdCustomers = await customerModuleService.createCustomers([{
        email: email,
        first_name: firstName,
        last_name: lastName || "",
        has_account: true,
      }]);
      
      customer = createdCustomers[0];
    }

    // Generate JWT token with correct structure for auth middleware
    const token = jwt.sign(
      {
        actor_id: customer.id,
        customer_id: customer.id,
        email: customer.email,
        provider: provider,
        app_metadata: {
          customer_id: customer.id,
        },
        scope: "store",
      },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "30d" }
    );

    console.log("[OAuth] Token generated for customer:", customer.id, "email:", customer.email);

    return res.status(200).json({
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        has_account: customer.has_account,
      },
    });
  } catch (error: any) {
    console.error("OAuth customer creation error:", error);
    return res.status(500).json({ 
      message: "Failed to create/retrieve OAuth customer",
      error: error.message 
    });
  }
}
