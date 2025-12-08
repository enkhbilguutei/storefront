import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Row,
  Column,
  Hr,
  Img,
} from "@react-email/components";
import * as React from "react";

interface OrderPlacedProps {
  orderId: string;
  customerName: string;
  totalAmount: string;
  items: Array<{
    title: string;
    quantity: number;
    price: string;
    thumbnail?: string;
  }>;
}

export const OrderPlacedEmail = ({
  orderId,
  customerName,
  totalAmount,
  items,
}: OrderPlacedProps) => (
  <Html>
    <Head />
    <Preview>Таны захиалга хүлээгдэж байна - #{orderId}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logoText}>Alimhan</Text>
        </Section>
        <Heading style={h1}>Захиалга хүлээж авлаа</Heading>
        <Text style={text}>Сайн байна уу, {customerName}?</Text>
        <Text style={text}>
          Таны #{orderId} дугаартай захиалгыг бид хүлээж авлаа. Таны захиалга одоогоор хүлээгдэж байгаа бөгөөд төлбөр төлөгдсөний дараа баталгаажих болно.
        </Text>
        
        <Section style={orderInfo}>
          <Text style={h2}>Захиалгын мэдээлэл</Text>
          {items.map((item, index) => (
            <Row key={index} style={itemRow}>
              <Column style={{ width: "64px", paddingRight: "16px" }}>
                {item.thumbnail ? (
                  <Img
                    src={item.thumbnail}
                    width="64"
                    height="64"
                    alt={item.title}
                    style={productImage}
                  />
                ) : (
                  <div style={placeholderImage}></div>
                )}
              </Column>
              <Column>
                <Text style={itemTitle}>
                  {item.title}
                </Text>
                <Text style={itemQuantity}>
                  Тоо ширхэг: {item.quantity}
                </Text>
              </Column>
              <Column align="right" style={{ verticalAlign: "top" }}>
                <Text style={itemPrice}>{item.price}</Text>
              </Column>
            </Row>
          ))}
          <Hr style={hr} />
          <Row>
            <Column>
              <Text style={totalLabel}>Нийт дүн:</Text>
            </Column>
            <Column align="right">
              <Text style={totalAmountText}>{totalAmount}</Text>
            </Column>
          </Row>
        </Section>

        <Text style={footer}>
          Хэрэв танд асуулт байвал бидэнтэй холбогдоно уу.
          <br />
          Alimhan баг
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#ffffff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const logoSection = {
  padding: "20px 0",
  textAlign: "center" as const,
};

const logoText = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1a1a1a",
  margin: "0",
};

const h1 = {
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0",
  padding: "0",
  color: "#1a1a1a",
  textAlign: "center" as const,
};

const h2 = {
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px",
  color: "#1a1a1a",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333",
  marginBottom: "16px",
};

const orderInfo = {
  padding: "24px",
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  marginTop: "24px",
  border: "1px solid #e6ebf1",
};

const itemRow = {
  marginBottom: "16px",
};

const productImage = {
  borderRadius: "4px",
  objectFit: "cover" as const,
};

const placeholderImage = {
  width: "64px",
  height: "64px",
  backgroundColor: "#e6ebf1",
  borderRadius: "4px",
};

const itemTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#333",
  margin: "0 0 4px",
};

const itemQuantity = {
  fontSize: "12px",
  color: "#666",
  margin: "0",
};

const itemPrice = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#333",
  margin: "0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const totalLabel = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#666",
  margin: "0",
};

const totalAmountText = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#1a1a1a",
  margin: "0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  marginTop: "48px",
  textAlign: "center" as const,
  lineHeight: "20px",
};

export default OrderPlacedEmail;
