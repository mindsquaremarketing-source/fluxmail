import { Html, Head, Body, Container, Section, Text, Hr } from "@react-email/components";

interface WelcomeEmailProps {
  storeName: string;
}

export default function WelcomeEmail({ storeName = "Your Store" }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f4f4f5" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
          <Section style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "8px" }}>
            <Text style={{ fontSize: "24px", fontWeight: "bold" }}>
              Welcome to EmailWiz Pro!
            </Text>
            <Hr />
            <Text>
              Hi there! Your store <strong>{storeName}</strong> is now connected to EmailWiz Pro.
            </Text>
            <Text>
              You can now create and send beautiful email campaigns to your customers.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
