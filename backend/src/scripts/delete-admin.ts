import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function deleteAdmin({ container }: ExecArgs) {
  const userModuleService = container.resolve(Modules.USER);
  const authModuleService = container.resolve(Modules.AUTH);

  const email = "admin@alimhan.mn";

  console.log("Deleting admin user...");

  // Find and delete existing user
  const existingUsers = await userModuleService.listUsers({ email });
  
  if (existingUsers.length > 0) {
    const userId = existingUsers[0].id;
    console.log(`Found existing user: ${userId}`);
    
    // Try to find and delete existing auth identities
    try {
      const authIdentities = await authModuleService.listAuthIdentities({});
      console.log(`Found ${authIdentities.length} total auth identities`);
      
      for (const identity of authIdentities) {
        console.log(`Checking identity: ${identity.id}, app_metadata:`, identity.app_metadata);
        if (identity.app_metadata?.user_id === userId) {
          console.log(`Deleting auth identity: ${identity.id}`);
          await authModuleService.deleteAuthIdentities([identity.id]);
        }
      }
    } catch (e) {
      console.log("Error with auth identities:", e);
    }
    
    // Delete the user
    console.log(`Deleting user: ${userId}`);
    await userModuleService.deleteUsers([userId]);
    console.log("User deleted successfully!");
  } else {
    console.log("No user found with that email");
  }
}
