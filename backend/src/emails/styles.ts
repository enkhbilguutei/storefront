/**
 * Shared email template styles for all order-related emails
 */

export const main = {
  backgroundColor: "#ffffff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

export const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

export const logoSection = {
  padding: "20px 0",
  textAlign: "center" as const,
};

export const logoText = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1a1a1a",
  margin: "0",
};

export const h1 = {
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0",
  padding: "0",
  color: "#1a1a1a",
  textAlign: "center" as const,
};

export const h2 = {
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px",
  color: "#1a1a1a",
};

export const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333",
  marginBottom: "16px",
};

export const orderInfo = {
  padding: "24px",
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  marginTop: "24px",
  border: "1px solid #e6ebf1",
};

export const itemRow = {
  marginBottom: "16px",
};

export const productImage = {
  borderRadius: "4px",
  objectFit: "cover" as const,
};

export const placeholderImage = {
  width: "64px",
  height: "64px",
  backgroundColor: "#e6ebf1",
  borderRadius: "4px",
};

export const itemTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#333",
  margin: "0 0 4px",
};

export const itemQuantity = {
  fontSize: "12px",
  color: "#666",
  margin: "0",
};

export const itemPrice = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#333",
  margin: "0",
};

export const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

export const totalLabel = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#666",
  margin: "0",
};

export const totalAmountText = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#1a1a1a",
  margin: "0",
};

export const footer = {
  color: "#8898aa",
  fontSize: "12px",
  marginTop: "48px",
  textAlign: "center" as const,
  lineHeight: "20px",
};
