import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function createAdmin({ container }: ExecArgs) {
  const userModuleService = container.resolve(Modules.USER);
  const authModuleService = container.resolve(Modules.AUTH);

  const email = "admin@alimhan.mn";
  const password = "applebyalimhan";

  // Check if user already exists
  const existingUsers = await userModuleService.listUsers({ email });
  
  if (existingUsers.length > 0) {
    console.log(`User ${email} already exists`);
    
    // Check if auth identity exists and update if needed
    const authIdentities = await authModuleService.listAuthIdentities({
      app_metadata: { user_id: existingUsers[0].id }
    });
    
    if (authIdentities.length === 0) {
      console.log("Auth identity missing, creating...");
      // Create auth identity with proper provider identity
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
          user_id: existingUsers[0].id,
        },
      });
      console.log("Auth identity created!");
    }
    return;
  }

  // Create the user
  const user = await userModuleService.createUsers({
    email,
    first_name: "Admin",
    last_name: "Alimhan",
  });

  // Create auth identity with proper provider identity
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

  console.log(`Admin user created successfully!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}
