import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function resetAdmin({ container }: ExecArgs) {
  const userModuleService = container.resolve(Modules.USER);
  const authModuleService = container.resolve(Modules.AUTH);

  const email = "admin@alimhan.mn";
  const password = "applebyalimhan";

  console.log("Starting admin reset process...");

  // Find and delete existing user
  const existingUsers = await userModuleService.listUsers({ email });
  
  if (existingUsers.length > 0) {
    const userId = existingUsers[0].id;
    console.log(`Found existing user: ${userId}`);
    
    // Try to find and delete existing auth identities
    try {
      const authIdentities = await authModuleService.listAuthIdentities({});
      console.log(`Found ${authIdentities.length} auth identities`);
      
      for (const identity of authIdentities) {
        if (identity.app_metadata?.user_id === userId) {
          console.log(`Deleting auth identity: ${identity.id}`);
          await authModuleService.deleteAuthIdentities([identity.id]);
        }
      }
    } catch (e) {
      console.log("Error finding auth identities:", e);
    }
    
    // Delete the user
    console.log(`Deleting user: ${userId}`);
    await userModuleService.deleteUsers([userId]);
    console.log("User deleted");
  }

  // Create new user
  console.log("Creating new admin user...");
  const user = await userModuleService.createUsers({
    email,
    first_name: "Admin",
    last_name: "Alimhan",
  });
  console.log(`Created user: ${user.id}`);

  // Create auth identity
  console.log("Creating auth identity...");
  const authIdentity = await authModuleService.createAuthIdentities({
    provider_identities: [
      {
        provider: "emailpass",
        entity_id: email,
        provider_metadata: {
          password,
        },
      },
    ],
    app_metadata: {
      user_id: user.id,
    },
  });
  console.log(`Created auth identity: ${authIdentity.id}`);

  console.log(`\n✅ Admin user reset successfully!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}
