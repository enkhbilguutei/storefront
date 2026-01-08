import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

interface RequiredEnvVars {
  [key: string]: {
    required: boolean;
    description: string;
    defaultValue?: string;
  };
}

const REQUIRED_ENV_VARS: RequiredEnvVars = {
  // Database
  DATABASE_URL: {
    required: true,
    description: "PostgreSQL database connection string",
  },
  
  // Medusa Core
  JWT_SECRET: {
    required: true,
    description: "Secret for JWT token signing",
  },
  COOKIE_SECRET: {
    required: true,
    description: "Secret for cookie signing",
  },
  
  // CORS
  STORE_CORS: {
    required: true,
    description: "Allowed origins for store API",
    defaultValue: "http://localhost:3000",
  },
  ADMIN_CORS: {
    required: true,
    description: "Allowed origins for admin API",
    defaultValue: "http://localhost:7001,http://localhost:7000",
  },
  AUTH_CORS: {
    required: true,
    description: "Allowed origins for auth endpoints",
    defaultValue: "http://localhost:3000",
  },
  
  // Meilisearch
  MEILISEARCH_HOST: {
    required: true,
    description: "Meilisearch server URL",
    defaultValue: "http://localhost:7700",
  },
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: {
    required: true,
    description: "Cloudinary cloud name for image hosting",
  },
  CLOUDINARY_API_KEY: {
    required: true,
    description: "Cloudinary API key",
  },
  CLOUDINARY_API_SECRET: {
    required: true,
    description: "Cloudinary API secret",
  },
  
  // QPay (Optional but needed for payments)
  QPAY_CLIENT_ID: {
    required: false,
    description: "QPay API client ID",
  },
  QPAY_CLIENT_SECRET: {
    required: false,
    description: "QPay API client secret",
  },
  QPAY_INVOICE_CODE: {
    required: false,
    description: "QPay invoice code",
  },
  
  // Redis (Optional but recommended)
  REDIS_URL: {
    required: false,
    description: "Redis connection string for caching and events",
  },
};

export default async function validateEnvironment({ container }: any) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  
  logger.info("=".repeat(60));
  logger.info("🔍 Validating environment variables...");
  logger.info("=".repeat(60));

  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[key];

    if (!value || value.trim() === "") {
      if (config.required) {
        errors.push(`❌ ${key}: ${config.description} (REQUIRED)`);
      } else {
        warnings.push(`⚠️  ${key}: ${config.description} (Optional)`);
      }
      
      if (config.defaultValue) {
        info.push(`   Using default: ${config.defaultValue}`);
      }
    } else {
      // Check for weak secrets
      if (key.includes("SECRET") && (value === "supersecret" || value === "secret" || value.length < 32)) {
        warnings.push(`⚠️  ${key}: Using weak/default secret. Please use a strong random value in production!`);
      } else {
        logger.info(`✅ ${key}: Set`);
      }
    }
  }

  // Additional validation
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("postgres://")) {
    warnings.push("⚠️  DATABASE_URL should start with 'postgres://' or 'postgresql://'");
  }

  // Check QPay configuration completeness
  const qpayVars = ["QPAY_CLIENT_ID", "QPAY_CLIENT_SECRET", "QPAY_INVOICE_CODE"];
  const qpaySet = qpayVars.filter(v => process.env[v]);
  
  if (qpaySet.length > 0 && qpaySet.length < qpayVars.length) {
    warnings.push("⚠️  QPay is partially configured. All of QPAY_CLIENT_ID, QPAY_CLIENT_SECRET, and QPAY_INVOICE_CODE are needed.");
  }

  // Print results
  logger.info("\n");
  
  if (errors.length > 0) {
    logger.error("🚨 CRITICAL ERRORS - Application may not work correctly:");
    errors.forEach(err => logger.error(err));
    logger.info("\n");
  }

  if (warnings.length > 0) {
    logger.warn("⚠️  WARNINGS:");
    warnings.forEach(warn => logger.warn(warn));
    logger.info("\n");
  }

  if (info.length > 0) {
    info.forEach(i => logger.info(i));
    logger.info("\n");
  }

  if (errors.length === 0 && warnings.length === 0) {
    logger.info("✨ All required environment variables are properly configured!");
  }

  logger.info("=".repeat(60));

  // Fail if critical errors
  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed. ${errors.length} required variable(s) missing. ` +
      "Please check the logs above and set the required environment variables."
    );
  }
}
