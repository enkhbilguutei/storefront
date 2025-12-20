import { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http";
import jwt from "jsonwebtoken";

export async function customAuthMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const secret = process.env.JWT_SECRET || "supersecret";
      const decoded = jwt.verify(token, secret) as any;
      
      const authPayload = {
        actor_id: decoded.actor_id,
        auth_identity_id: decoded.auth_identity_id,
        app_metadata: decoded.app_metadata,
        scope: decoded.scope,
      };

      // Preserve both fields for compatibility across handlers
      (req as any).auth_context = authPayload;
      (req as any).auth = authPayload;
    } catch (e) {
      console.error("[Auth] Token verification failed:", e instanceof Error ? e.message : String(e));
    }
  }
  next();
}
