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
import * as styles from "./styles";

interface AbandonedCartProps {
  cartId: string;
  customerEmail: string;
  items: Array<{
    title: string;
    quantity: number;
    price: string;
    thumbnail?: string;
  }>;
  subtotal: string;
  cartUrl: string;
  discountCode?: string;
}

export const AbandonedCartEmail = ({
  cartId,
  customerEmail,
  items,
  subtotal,
  cartUrl,
  discountCode = "CART10",
}: AbandonedCartProps) => (
  <Html>
    <Head />
    <Preview>Таны сагсанд бүтээгдэхүүн үлдсэн байна 🛒</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.logoSection}>
          <Text style={styles.logoText}>Alimhan</Text>
        </Section>
        
        <Heading style={styles.h1}>Таны сагсанд бүтээгдэхүүн үлдсэн байна 🛒</Heading>
        
        <Text style={styles.text}>
          Сайн байна уу?
        </Text>
        
        <Text style={styles.text}>
          Та манай дэлгүүрээс бүтээгдэхүүн сагсалж байсан байна. Захиалгаа дуусгах санаатай байвал бид танд туслахад бэлэн байна!
        </Text>

        <Section style={discountBanner}>
          <Text style={discountTitle}>🎁 Онцгой санал</Text>
          <Text style={discountText}>
            Дараах <strong>24 цагийн дотор</strong> захиалгаа дуусгавал
          </Text>
          <Text style={discountAmount}>10% хөнгөлөлт</Text>
          <Text style={discountCodeText}>
            Промо код: <strong style={codeHighlight}>{discountCode}</strong>
          </Text>
        </Section>

        <Section style={styles.orderInfo}>
          <Text style={styles.h2}>Таны сагсанд байгаа бүтээгдэхүүн</Text>
          {items.map((item, index) => (
            <Row key={index} style={styles.itemRow}>
              <Column style={{ width: "64px", paddingRight: "16px" }}>
                {item.thumbnail ? (
                  <Img
                    src={item.thumbnail}
                    width="64"
                    height="64"
                    alt={item.title}
                    style={styles.productImage}
                  />
                ) : (
                  <div style={styles.placeholderImage}></div>
                )}
              </Column>
              <Column>
                <Text style={styles.itemTitle}>
                  {item.title}
                </Text>
                <Text style={styles.itemQuantity}>
                  Тоо ширхэг: {item.quantity}
                </Text>
              </Column>
              <Column align="right" style={{ verticalAlign: "top" }}>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </Column>
            </Row>
          ))}
          <Hr style={styles.hr} />
          <Row>
            <Column>
              <Text style={styles.totalLabel}>Нийт дүн:</Text>
            </Column>
            <Column align="right">
              <Text style={styles.totalAmountText}>{subtotal}</Text>
            </Column>
          </Row>
        </Section>

        <Section style={ctaSection}>
          <a style={button} href={cartUrl}>
            Захиалгаа дуусгах
          </a>
        </Section>

        <Text style={urgencyText}>
          ⏰ Энэ хөнгөлөлт дараах 24 цагийн дотор хүчинтэй!
        </Text>

        <Text style={styles.footer}>
          Хэрэв танд асуулт байвал бидэнтэй холбогдоно уу.
          <br />
          Alimhan баг
        </Text>
      </Container>
    </Body>
  </Html>
);

// Additional styles specific to abandoned cart email
const discountBanner = {
  padding: "24px",
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  marginTop: "24px",
  marginBottom: "24px",
  border: "2px solid #fbbf24",
  textAlign: "center" as const,
};

const discountTitle = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#92400e",
  margin: "0 0 12px",
};

const discountText = {
  fontSize: "16px",
  color: "#78350f",
  margin: "0 0 8px",
};

const discountAmount = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#b45309",
  margin: "12px 0",
};

const discountCodeText = {
  fontSize: "16px",
  color: "#78350f",
  margin: "12px 0 0",
};

const codeHighlight = {
  backgroundColor: "#ffffff",
  padding: "4px 12px",
  borderRadius: "4px",
  border: "1px solid #fbbf24",
  fontFamily: "monospace",
  fontSize: "18px",
};

const ctaSection = {
  textAlign: "center" as const,
  marginTop: "32px",
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#1a1a1a",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 48px",
};

const urgencyText = {
  fontSize: "14px",
  color: "#b45309",
  textAlign: "center" as const,
  fontWeight: "600",
  marginTop: "24px",
};

export default AbandonedCartEmail;
