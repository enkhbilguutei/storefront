import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { ICustomerModuleService } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest } from "../../../../types/api";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const authContext = (req as AuthenticatedMedusaRequest).auth_context;
  
  if (!authContext?.actor_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const customerModuleService: ICustomerModuleService = req.scope.resolve(Modules.CUSTOMER);
  
  try {
    const customer = await customerModuleService.retrieveCustomer(authContext.actor_id, {
      relations: ["addresses"] 
    });
    
    return res.json({ customer });
  } catch (error) {
    return res.status(404).json({ message: "Customer not found" });
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const authContext = (req as AuthenticatedMedusaRequest).auth_context;
  
  console.log("[POST /store/custom/me] Auth context:", authContext);
  console.log("[POST /store/custom/me] Body:", req.body);
  
  if (!authContext?.actor_id) {
    console.error("[POST /store/custom/me] No actor_id in auth_context");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const customerModuleService: ICustomerModuleService = req.scope.resolve(Modules.CUSTOMER);
  
  try {
    const { first_name, last_name, phone } = req.body as {
      first_name?: string;
      last_name?: string;
      phone?: string;
    };

    console.log("[POST /store/custom/me] Updating customer:", authContext.actor_id, { first_name, last_name, phone });

    // Update the customer
    await customerModuleService.updateCustomers(authContext.actor_id, {
      first_name,
      last_name,
      phone,
    });
    
    // Retrieve the updated customer
    const customer = await customerModuleService.retrieveCustomer(authContext.actor_id, {
      relations: ["addresses"]
    });
    
    console.log("[POST /store/custom/me] Update successful");
    
    return res.json({ customer });
  } catch (error) {
    console.error("[POST /store/custom/me] Error updating customer:", error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to update customer" 
    });
  }
}
