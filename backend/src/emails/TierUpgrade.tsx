import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as styles from "./styles";

interface TierUpgradeEmailProps {
  customerName: string;
  oldTier: string;
  newTier: string;
  newBenefits: string[];
  pointsBalance: number;
}

const tierTranslations: Record<string, string> = {
  BRONZE: "Хүрэл",
  SILVER: "Мөнгө",
  GOLD: "Алт",
  PLATINUM: "Цагаан алт",
};

export const TierUpgradeEmail = ({
  customerName = "Харилцагч",
  oldTier = "BRONZE",
  newTier = "SILVER",
  newBenefits = [],
  pointsBalance = 0,
}: TierUpgradeEmailProps) => {
  const oldTierMn = tierTranslations[oldTier] || oldTier;
  const newTierMn = tierTranslations[newTier] || newTier;

  return (
    <Html>
      <Head />
      <Preview>
        Баяр хүргэе! Та {newTierMn} зэрэгт шилжлээ
      </Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>
            🎉 Зэрэг дэвшилт!
          </Heading>

          <Section style={{ padding: "20px 0" }}>
            <Text style={styles.text}>
              Сайн байна уу {customerName},
            </Text>

            <Text style={styles.text}>
              Баяр хүргэе! Та <strong>{oldTierMn}</strong> зэргээс{" "}
              <strong>{newTierMn}</strong> зэрэгт шилжлээ! 🎊
            </Text>

            <Text style={styles.text}>
              Таны одоогийн оноо: <strong>{pointsBalance.toLocaleString()}</strong>
            </Text>
          </Section>

          {newBenefits.length > 0 && (
            <Section style={{ padding: "20px 0" }}>
              <Text style={{ ...styles.text, fontWeight: "bold" }}>
                Таны шинэ давуу талууд:
              </Text>
              {newBenefits.map((benefit, index) => (
                <Text key={index} style={styles.text}>
                  ✓ {benefit}
                </Text>
              ))}
            </Section>
          )}

          <Section style={{ padding: "20px 0" }}>
            <Text style={styles.text}>
              Таны үнэнч байдалд баярлалаа!
            </Text>
            <Text style={styles.text}>Алимхан баг</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default TierUpgradeEmail;
