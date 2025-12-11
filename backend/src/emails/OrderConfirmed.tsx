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

interface OrderConfirmedProps {
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

export const OrderConfirmedEmail = ({
  orderId,
  customerName,
  totalAmount,
  items,
}: OrderConfirmedProps) => (
  <Html>
    <Head />
    <Preview>Таны захиалга баталгаажлаа - #{orderId}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logoText}>Alimhan</Text>
        </Section>
        <Heading style={h1}>Захиалга баталгаажлаа</Heading>
        <Text style={text}>Сайн байна уу, {customerName}?</Text>
        <Text style={text}>
          Таны #{orderId} дугаартай захиалгын төлбөр амжилттай төлөгдөж, захиалга баталгаажлаа. Бид таны захиалгыг удахгүй хүргэх болно.
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
  itemPrice,
  hr,
  totalLabel,
  totalAmountText,
  footer,
} = styles;

export default OrderConfirmedEmail;
