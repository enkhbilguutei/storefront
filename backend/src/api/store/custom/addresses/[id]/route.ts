import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { ICustomerModuleService } from "@medusajs/framework/types";
import { AuthenticatedMedusaRequest } from "../../../../../types/api";

interface UpdateAddressBody {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  province?: string;
  country_code?: string;
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
  const addressId = req.params.id;
  
  try {
    const { first_name, last_name, phone, address_1, address_2, city, province, country_code } = req.body as UpdateAddressBody;

    // Update address
    await customerModuleService.updateCustomerAddresses(addressId, {
      first_name,
      last_name,
      phone,
      address_1,
      address_2,
      city,
      province,
      country_code: country_code || "mn",
    });
    
    // Fetch updated address
    const customer = await customerModuleService.retrieveCustomer(authContext.actor_id, {
      relations: ["addresses"]
    });
    const address = customer.addresses?.find((a: any) => a.id === addressId);
    
    return res.json({ address });
  } catch (error) {
    console.error("Error updating address:", error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to update address" 
    });
  }
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const authContext = (req as AuthenticatedMedusaRequest).auth_context;
  
  if (!authContext?.actor_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const customerModuleService: ICustomerModuleService = req.scope.resolve(Modules.CUSTOMER);
  const addressId = req.params.id;
  
  try {
    await customerModuleService.deleteCustomerAddresses(addressId);
    
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to delete address" 
    });
  }
}
