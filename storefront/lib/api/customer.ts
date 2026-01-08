import { getBackendUrl, getAuthFetchOptions, handleUnauthorized } from "./client";

/**
 * Fetches customer profile data
 * @param accessToken - User's access token
 * @returns Customer data or null if unauthorized
 */
export async function fetchCustomerProfile(
  accessToken: string
): Promise<any | null> {
  try {
    const response = await fetch(
      getBackendUrl("/store/customers/me"),
      getAuthFetchOptions(accessToken)
    );

    if (handleUnauthorized(response)) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch customer");
    }

    const data = await response.json();
    return data.customer;
  } catch (error) {
    console.error("Error fetching customer:", error);
    throw error;
  }
}

/**
 * Fetches customer addresses
 * @param accessToken - User's access token
 * @returns Array of customer addresses or null if unauthorized
 */
export async function fetchCustomerAddresses(
  accessToken: string
): Promise<any[] | null> {
  try {
    const response = await fetch(
      getBackendUrl("/store/customers/me/addresses"),
      getAuthFetchOptions(accessToken)
    );

    if (handleUnauthorized(response)) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch addresses");
    }

    const data = await response.json();
    return data.addresses || [];
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw error;
  }
}

/**
 * Fetches both customer profile and addresses
 * @param accessToken - User's access token
 * @returns Object with customer and addresses or null if unauthorized
 */
export async function fetchCustomerData(accessToken: string): Promise<{
  customer: any;
  addresses: any[];
} | null> {
  try {
    const [customer, addresses] = await Promise.all([
      fetchCustomerProfile(accessToken),
      fetchCustomerAddresses(accessToken),
    ]);

    if (!customer || !addresses) {
      return null;
    }

    return { customer, addresses };
  } catch (error) {
    console.error("Error fetching customer data:", error);
    throw error;
  }
}
