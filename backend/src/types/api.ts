import { MedusaRequest } from "@medusajs/framework/http";

export interface AuthenticatedMedusaRequest extends MedusaRequest {
  auth_context: {
    actor_id: string;
    actor_type: string;
    auth_identity_id: string;
    app_metadata: Record<string, any>;
  };
}
