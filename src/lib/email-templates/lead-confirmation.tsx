import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface LeadConfirmationProps {
  name?: string;
  solutionInterest?: string;
  preferredTime?: string;
  phone?: string;
}

export function LeadConfirmation({
  name = "there",
  solutionInterest = "your energy project",
  preferredTime = "",
  phone = "404-454-0602",
}: LeadConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>We received your request — a technician will confirm shortly.</Preview>
      <Body style={{ backgroundColor: "#0d0f0e", margin: 0, padding: "24px 0" }}>
        <Container
          style={{
            backgroundColor: "#141716",
            border: "1px solid #2a2f2d",
            maxWidth: "560px",
            padding: "32px",
          }}
        >
          <Text
            style={{
              color: "#c98b4b",
              fontFamily: "monospace",
              fontSize: "12px",
              letterSpacing: "1px",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            Earth Protection Society
          </Text>
          <Heading
            style={{
              color: "#f2f4f2",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontSize: "24px",
              margin: "12px 0 0",
            }}
          >
            We got your request, {name}.
          </Heading>
          <Text
            style={{
              color: "#b6bdb8",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontSize: "15px",
              lineHeight: "24px",
            }}
          >
            A community-trained technician is reviewing your {solutionInterest} scope and will
            reach out to confirm the details.
          </Text>
          {preferredTime ? (
            <Section
              style={{
                backgroundColor: "#0d0f0e",
                border: "1px solid #2a2f2d",
                padding: "16px",
              }}
            >
              <Text
                style={{
                  color: "#8d948f",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  letterSpacing: "1px",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                Requested time
              </Text>
              <Text
                style={{
                  color: "#f2f4f2",
                  fontFamily: "Helvetica, Arial, sans-serif",
                  fontSize: "16px",
                  margin: "6px 0 0",
                }}
              >
                {preferredTime}
              </Text>
            </Section>
          ) : null}
          <Hr style={{ borderColor: "#2a2f2d", margin: "24px 0" }} />
          <Text
            style={{
              color: "#b6bdb8",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontSize: "14px",
              lineHeight: "22px",
              margin: 0,
            }}
          >
            Need us sooner? Call or text {phone}.
          </Text>
          <Text
            style={{
              color: "#8d948f",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontSize: "12px",
              marginTop: "16px",
            }}
          >
            Customer-funded. Locally owned. Serviced by the block.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const template = {
  component: LeadConfirmation,
  displayName: "Inquiry confirmation",
  subject: "We received your request — Earth Protection Society",
  previewData: {
    name: "Kenneth",
    solutionInterest: "Home Battery + Solar",
    preferredTime: "Tue, Sep 15 · 10:00 AM",
    phone: "404-454-0602",
  },
} satisfies TemplateEntry;
