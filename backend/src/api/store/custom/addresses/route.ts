import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { ICustomerModuleService } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest } from "../../../../types/api";

interface CreateAddressBody {
  first_name: string;
  last_name: string;
  phone: string;
  address_1: string;
  address_2?: string;
  city: string;
  province?: string;
  country_code?: string;
}

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
    
    return res.json({ addresses: customer.addresses || [] });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return res.status(500).json({ message: "Failed to fetch addresses" });
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const authContext = (req as AuthenticatedMedusaRequest).auth_context;
  
  if (!authContext?.actor_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const customerModuleService: ICustomerModuleService = req.scope.resolve(Modules.CUSTOMER);
  
  try {
    const { first_name, last_name, phone, address_1, address_2, city, province, country_code } = req.body as CreateAddressBody;

    // Create address for customer
    const address = await customerModuleService.createCustomerAddresses({
      customer_id: authContext.actor_id,
      first_name,
      last_name,
      phone,
      address_1,
      address_2,
      city,
      province,
      country_code: country_code || "mn",
    });
    
    return res.json({ address });
  } catch (error) {
    console.error("Error creating address:", error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to create address" 
    });
  }
}
