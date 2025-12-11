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

interface OrderShippedProps {
  orderId: string;
  customerName: string;
  items: Array<{
    title: string;
    quantity: number;
    thumbnail?: string;
  }>;
}

export const OrderShippedEmail = ({
  orderId,
  customerName,
  items,
}: OrderShippedProps) => (
  <Html>
    <Head />
    <Preview>Таны захиалга хүргэлтэнд гарлаа - #{orderId}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logoText}>Alimhan</Text>
        </Section>
        <Heading style={h1}>Захиалга хүргэлтэнд гарлаа</Heading>
        <Text style={text}>Сайн байна уу, {customerName}?</Text>
        <Text style={text}>
          Таны #{orderId} дугаартай захиалга хүргэлтэнд гарлаа. Бид тантай удахгүй холбогдох болно.
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
            </Row>
          ))}
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

// Use shared styles
const {
  main,
  container,
  logoSection,
  logoText,
  h1,
  h2,
  text,
  orderInfo,
  itemRow,
  productImage,
  placeholderImage,
  itemTitle,
  itemQuantity,
  footer,
} = styles;

export default OrderShippedEmail;
