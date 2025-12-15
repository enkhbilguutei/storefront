import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createUserAccountWorkflow } from "@medusajs/core-flows";

export default async function createAdmin({ container }: ExecArgs) {
  const userModuleService = container.resolve(Modules.USER);

  const email = "admin@alimhan.mn";
  const password = "applybyalimhan";

  // Check if user already exists
  const existingUsers = await userModuleService.listUsers({ email });
  
  if (existingUsers.length > 0) {
    console.log(`User ${email} already exists`);
    console.log(`To reset the admin, run: npx medusa exec ./src/scripts/delete-admin.ts`);
    console.log(`Then run: npx medusa user -e ${email} -p ${password}`);
    return;
  }

  // Use the proper workflow which handles password hashing
  const { result } = await createUserAccountWorkflow(container).run({
    input: {
      authIdentityId: undefined as any, // Will be created by the workflow
      userData: {
        email,
        first_name: "Admin",
        last_name: "Alimhan",
      },
    },
  });

  console.log(`Admin user created successfully!`);
  console.log(`Email: ${email}`);
  console.log(`\n⚠️  NOTE: The password must be set via the Medusa CLI:`);
  console.log(`Run: npx medusa user -e ${email} -p ${password}`);
}
