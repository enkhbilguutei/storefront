import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { ICustomerModuleService } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest } from "../../../../types/api";
import { validateBody, updateProfileSchema, formatValidationErrors } from "../../../validations";

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
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
  
  if (!authContext?.actor_id) {
    logger.error("[POST /store/custom/me] No actor_id in auth_context");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const validation = validateBody(updateProfileSchema, req.body);
  
  if (!validation.success) {
    return res.status(400).json({ 
      message: "Validation failed",
      errors: formatValidationErrors(validation.errors)
    });
  }

  const customerModuleService: ICustomerModuleService = req.scope.resolve(Modules.CUSTOMER);
  
  try {
    const { first_name, last_name, phone } = validation.data;

    // Update the customer
    await customerModuleService.updateCustomers(authContext.actor_id, {
      first_name,
      last_name,
      phone,
    });

    // Fetch updated customer
    const customer = await customerModuleService.retrieveCustomer(authContext.actor_id, {
      relations: ["addresses"]
    });
    
    return res.json({ customer });
  } catch (error) {
    logger.error("[POST /store/custom/me] Error updating customer:", error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to update customer" 
    });
  }
}
