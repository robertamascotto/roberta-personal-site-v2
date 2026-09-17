import { useState } from "react";
import { definePlugin } from "sanity";
import {
  Card,
  TabList,
  Tab,
  TabPanel,
  Container,
  Stack,
  Heading,
  Text,
} from "@sanity/ui";
import { UploadIcon } from "@sanity/icons";
import { BulkImport } from "./BulkImport";
import { BulkEdit } from "./BulkEdit";

function BulkManagerTool() {
  const [tab, setTab] = useState<"import" | "edit">("import");

  return (
    <Card height="fill" overflow="auto" padding={4}>
      <Container width={4}>
        <Stack space={5}>
          <Stack space={3}>
            <Heading as="h1" size={3}>
              Bulk Manager
            </Heading>
            <Text size={1} muted>
              Import multiple photos at once or edit existing photos in bulk.
            </Text>
          </Stack>

          <TabList space={1}>
            <Tab
              aria-controls="import-panel"
              id="import-tab"
              label="Bulk Import"
              onClick={() => setTab("import")}
              selected={tab === "import"}
            />
            <Tab
              aria-controls="edit-panel"
              id="edit-tab"
              label="Bulk Edit"
              onClick={() => setTab("edit")}
              selected={tab === "edit"}
            />
          </TabList>

          {tab === "import" && (
            <TabPanel aria-labelledby="import-tab" id="import-panel">
              <BulkImport />
            </TabPanel>
          )}
          {tab === "edit" && (
            <TabPanel aria-labelledby="edit-tab" id="edit-panel">
              <BulkEdit />
            </TabPanel>
          )}
        </Stack>
      </Container>
    </Card>
  );
}

export const bulkManager = definePlugin({
  name: "bulk-manager",
  tools: [
    {
      name: "bulk-manager",
      title: "Bulk Manager",
      icon: UploadIcon,
      component: BulkManagerTool,
    },
  ],
});
