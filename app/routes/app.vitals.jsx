import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineGrid,
  Badge,
  EmptyState,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// Google's published thresholds for "good" vs "needs improvement" vs "poor",
// scored at the 75th percentile of real-user samples (CrUX methodology).
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // ms
  INP: { good: 200, poor: 500 }, // ms
  CLS: { good: 0.1, poor: 0.25 }, // unitless
};

function percentile(sortedValues, p) {
  if (sortedValues.length === 0) return null;
  const index = Math.ceil((p / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
}

function rateMetric(metric, p75) {
  if (p75 === null) return "no-data";
  const t = THRESHOLDS[metric];
  if (p75 <= t.good) return "good";
  if (p75 <= t.poor) return "warn";
  return "poor";
}

function badgeTone(rating) {
  if (rating === "good") return "success";
  if (rating === "warn") return "attention";
  if (rating === "poor") return "critical";
  return undefined;
}

function badgeLabel(rating) {
  if (rating === "good") return "Good";
  if (rating === "warn") return "Needs improvement";
  if (rating === "poor") return "Poor";
  return "No data yet";
}

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const since = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);

  const samples = await prisma.vitalSample.findMany({
    where: { shop, createdAt: { gte: since } },
    select: { metric: true, value: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const byMetric = { LCP: [], INP: [], CLS: [] };
  for (const s of samples) {
    if (byMetric[s.metric]) byMetric[s.metric].push(s.value);
  }

  const summary = {};
  for (const metric of Object.keys(byMetric)) {
    const sorted = [...byMetric[metric]].sort((a, b) => a - b);
    const p75 = percentile(sorted, 75);
    summary[metric] = {
      p75,
      sampleCount: sorted.length,
      rating: rateMetric(metric, p75),
    };
  }

  return { summary, totalSamples: samples.length, shop };
}

function formatValue(metric, p75) {
  if (p75 === null) return "\u2014";
  if (metric === "CLS") return p75.toFixed(2);
  return `${Math.round(p75)}ms`;
}

export default function VitalsDashboard() {
  const { summary, totalSamples, shop } = useLoaderData();

  if (totalSamples === 0) {
    return (
      <Page title="Core Web Vitals">
        <Layout>
          <Layout.Section>
            <Card>
              <EmptyState
                heading="No real-user data yet"
                image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
              >
                <p>
                  Turn on the AAW Speed Optimize vitals beacon in Theme editor &gt; App
                  embeds, then check back once visitors have loaded a few
                  storefront pages. Scores need real traffic — they will not
                  appear from preview or admin sessions.
                </p>
              </EmptyState>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="Core Web Vitals"
      subtitle={`p75 over the last 28 days \u00b7 ${shop} \u00b7 ${totalSamples} samples`}
    >
      <Layout>
        <Layout.Section>
          <InlineGrid columns={3} gap="400">
            {["LCP", "INP", "CLS"].map((metric) => {
              const m = summary[metric];
              return (
                <Card key={metric}>
                  <BlockStack gap="200">
                    <Text as="span" variant="bodySm" tone="subdued">
                      {metric === "LCP" && "Largest contentful paint"}
                      {metric === "INP" && "Interaction to next paint"}
                      {metric === "CLS" && "Cumulative layout shift"}
                    </Text>
                    <Text as="span" variant="heading2xl">
                      {formatValue(metric, m.p75)}
                    </Text>
                    <Badge tone={badgeTone(m.rating)}>
                      {badgeLabel(m.rating)}
                    </Badge>
                    <Text as="span" variant="bodySm" tone="subdued">
                      {m.sampleCount} samples
                    </Text>
                  </BlockStack>
                </Card>
              );
            })}
          </InlineGrid>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                How this is scored
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Each score is the 75th percentile of real visitor sessions
                collected by the storefront beacon, matching the methodology
                Google uses for Core Web Vitals pass/fail. A metric needs at
                least a few dozen samples before the percentile is stable.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
