import { Page, Layout, Card, Text, BlockStack, Button } from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <Page title="AAW Speed Optimize">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Welcome to AAW Speed Optimize
              </Text>
              <Text as="p" tone="subdued">
                Turn on the vitals beacon in Theme editor &gt; App embeds to
                start collecting real-user Core Web Vitals, then check the
                dashboard below.
              </Text>
              <Button onClick={() => navigate("/app/vitals")}>
                View Core Web Vitals
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
