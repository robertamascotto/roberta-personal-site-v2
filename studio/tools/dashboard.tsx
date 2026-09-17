import { useEffect, useState } from "react";
import { definePlugin, useClient } from "sanity";
import { useRouter } from "sanity/router";
import {
  Card,
  Stack,
  Flex,
  Grid,
  Box,
  Heading,
  Text,
  Button,
  Badge,
  Spinner,
  Container,
} from "@sanity/ui";
import {
  AddIcon,
  ImageIcon,
  UploadIcon,
  TagIcon,
  HomeIcon,
  WarningOutlineIcon,
} from "@sanity/icons";
import { apiVersion } from "../env";
import { CATEGORIES, getCategoryLabel } from "../../lib/constants";
import { categoryTone } from "../lib/helpers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Stats {
  total: number;
  byCategory: Record<string, number>;
  tags: number;
  missingAlt: number;
  untagged: number;
}

interface RecentPhoto {
  _id: string;
  alt: string;
  category: string;
  date: string;
  imageUrl: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | null;
  icon: React.ReactNode;
}) {
  return (
    <Card padding={4} radius={3} shadow={1} tone="default">
      <Stack space={3}>
        <Flex align="center" gap={2}>
          <Text size={2} muted>
            {icon}
          </Text>
          <Text size={1} muted weight="semibold" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {label}
          </Text>
        </Flex>
        {value === null ? (
          <Spinner muted />
        ) : (
          <Heading as="p" size={4}>
            {value.toLocaleString()}
          </Heading>
        )}
      </Stack>
    </Card>
  );
}

function RecentPhotoCard({ photo }: { photo: RecentPhoto }) {
  return (
    <Card padding={3} radius={3} shadow={1} tone="default">
      <Stack space={3}>
        {/* Thumbnail */}
        <Box
          style={{
            width: "100%",
            paddingBottom: "75%", // 4:3 aspect ratio
            position: "relative",
            borderRadius: "6px",
            overflow: "hidden",
            background: "var(--card-muted-bg-color, #f0ece8)",
          }}
        >
          {photo.imageUrl ? (
            <img
              src={photo.imageUrl}
              alt={photo.alt}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <Flex
              align="center"
              justify="center"
              style={{ position: "absolute", inset: 0 }}
            >
              <Text size={4} muted>
                <ImageIcon />
              </Text>
            </Flex>
          )}
        </Box>

        {/* Meta */}
        <Stack space={2}>
          <Text size={1} weight="semibold" style={{ lineHeight: 1.3 }}>
            {photo.alt || "Untitled"}
          </Text>
          <Flex align="center" gap={2} wrap="wrap">
            <Badge
              tone={categoryTone(photo.category)}
              radius={2}
              fontSize={0}
              padding={2}
            >
              {getCategoryLabel(photo.category)}
            </Badge>
            {photo.date && (
              <Text size={0} muted>
                {formatDate(photo.date)}
              </Text>
            )}
          </Flex>
        </Stack>
      </Stack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard component
// ---------------------------------------------------------------------------

function DashboardTool() {
  const client = useClient({ apiVersion });
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [recentPhotos, setRecentPhotos] = useState<RecentPhoto[] | null>(null);
  const [siteName, setSiteName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Current date formatted nicely
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const result = await client.fetch<{
          total: number;
          byCategory: { slug: string; count: number }[];
          tags: number;
          missingAlt: number;
          untagged: number;
          siteName: string | null;
          recent: Array<{
            _id: string;
            alt: string;
            category: string;
            date: string;
            imageUrl: string | null;
          }>;
        }>(`{
          "total": count(*[_type == "photo"]),
          "byCategory": [
            ${CATEGORIES.map((cat) => `{"slug": "${cat.slug}", "count": count(*[_type == "photo" && category == "${cat.slug}"])}`).join(",\n            ")}
          ],
          "tags": count(*[_type == "tag"]),
          "missingAlt": count(*[_type == "photo" && (alt == "" || !defined(alt))]),
          "untagged": count(*[_type == "photo" && (count(tags) == 0 || !defined(tags))]),
          "siteName": *[_type == "siteConfig"][0].siteName,
          "recent": *[_type == "photo"] | order(_createdAt desc) [0...8] {
            _id, alt, category, date, "imageUrl": image.asset->url
          }
        }`);

        if (cancelled) return;

        const byCategory: Record<string, number> = {};
        for (const { slug, count } of result.byCategory) {
          byCategory[slug] = count;
        }

        setStats({
          total: result.total,
          byCategory,
          tags: result.tags,
          missingAlt: result.missingAlt,
          untagged: result.untagged,
        });
        setSiteName(result.siteName || null);
        setRecentPhotos(
          result.recent.map((p) => ({
            ...p,
            imageUrl: p.imageUrl
              ? `${p.imageUrl}?w=200&h=150&fit=crop`
              : null,
          }))
        );
      } catch (err) {
        console.error("[Dashboard] Failed to fetch stats:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [client]);

  // ---------------------------------------------------------------------------
  // Navigation handlers
  // ---------------------------------------------------------------------------

  function handleNewPhoto(template: string) {
    router.navigateIntent("create", { type: "photo", template });
  }

  function handleBulkManager() {
    router.navigateUrl({ path: "/bulk-manager" });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Card height="fill" overflow="auto" padding={5}>
      <Container width={4}>
        <Stack space={6}>
          {/* ---------------------------------------------------------------- */}
          {/* Welcome header                                                    */}
          {/* ---------------------------------------------------------------- */}
          <Stack space={2}>
            <Heading as="h1" size={4}>
              Welcome back{siteName ? `, ${siteName.split(" ")[0]}` : ""}
            </Heading>
            <Text size={1} muted>
              {today}
            </Text>
          </Stack>

          {/* ---------------------------------------------------------------- */}
          {/* Stats row                                                         */}
          {/* ---------------------------------------------------------------- */}
          <Stack space={3}>
            <Heading as="h2" size={1} style={{ textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Library Overview
            </Heading>
            {loading ? (
              <Flex padding={5} justify="center">
                <Spinner muted />
              </Flex>
            ) : (
              <Grid columns={[2, 2, 5]} gap={3}>
                <StatCard
                  label="Total Photos"
                  value={stats?.total ?? null}
                  icon={<ImageIcon />}
                />
                {CATEGORIES.map((cat) => (
                  <StatCard
                    key={cat.slug}
                    label={cat.label}
                    value={stats?.byCategory[cat.slug] ?? null}
                    icon={<ImageIcon />}
                  />
                ))}
                <StatCard
                  label="Tags"
                  value={stats?.tags ?? null}
                  icon={<TagIcon />}
                />
              </Grid>
            )}
          </Stack>

          {/* ---------------------------------------------------------------- */}
          {/* Attention needed                                                  */}
          {/* ---------------------------------------------------------------- */}
          {!loading && stats && (stats.missingAlt > 0 || stats.untagged > 0) && (
            <Stack space={3}>
              <Heading as="h2" size={1} style={{ textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Needs Attention
              </Heading>
              <Flex gap={3} wrap="wrap">
                {stats.missingAlt > 0 && (
                  <Card padding={3} radius={3} shadow={1} tone="caution">
                    <Flex align="center" gap={3}>
                      <Text size={2}><WarningOutlineIcon /></Text>
                      <Text size={1}>
                        <strong>{stats.missingAlt}</strong> photo{stats.missingAlt !== 1 ? "s" : ""} missing alt text
                      </Text>
                      <Button
                        text="Open Bulk Manager"
                        mode="ghost"
                        tone="caution"
                        fontSize={0}
                        onClick={handleBulkManager}
                      />
                    </Flex>
                  </Card>
                )}
                {stats.untagged > 0 && (
                  <Card padding={3} radius={3} shadow={1} tone="caution">
                    <Flex align="center" gap={3}>
                      <Text size={2}><TagIcon /></Text>
                      <Text size={1}>
                        <strong>{stats.untagged}</strong> photo{stats.untagged !== 1 ? "s" : ""} without tags
                      </Text>
                      <Button
                        text="Open Bulk Manager"
                        mode="ghost"
                        tone="caution"
                        fontSize={0}
                        onClick={handleBulkManager}
                      />
                    </Flex>
                  </Card>
                )}
              </Flex>
            </Stack>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Quick actions                                                     */}
          {/* ---------------------------------------------------------------- */}
          <Stack space={3}>
            <Heading as="h2" size={1} style={{ textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Quick Actions
            </Heading>
            <Flex gap={3} wrap="wrap">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.slug}
                  icon={AddIcon}
                  text={`New ${cat.label} Photo`}
                  tone="primary"
                  mode="ghost"
                  onClick={() => handleNewPhoto(`photo-${cat.slug}`)}
                />
              ))}
              <Button
                icon={UploadIcon}
                text="Bulk Import"
                tone="default"
                mode="ghost"
                onClick={handleBulkManager}
              />
            </Flex>
          </Stack>

          {/* ---------------------------------------------------------------- */}
          {/* Tips                                                               */}
          {/* ---------------------------------------------------------------- */}
          <Card padding={4} radius={3} tone="primary" border>
            <Stack space={3}>
              <Text size={1} weight="semibold">
                Quick Tip: Drafts & Publishing
              </Text>
              <Text size={1} muted>
                All changes start as a draft. Make your edits, then click <strong>Publish</strong> to make them live. To change something that's already published, just start editing — a new draft is created automatically.
              </Text>
            </Stack>
          </Card>

          {/* ---------------------------------------------------------------- */}
          {/* Recent uploads                                                    */}
          {/* ---------------------------------------------------------------- */}
          <Stack space={3}>
            <Heading as="h2" size={1} style={{ textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Recent Uploads
            </Heading>

            {loading ? (
              <Flex padding={5} justify="center">
                <Spinner muted />
              </Flex>
            ) : recentPhotos && recentPhotos.length > 0 ? (
              <Grid columns={[2, 4, 4]} gap={3}>
                {recentPhotos.map((photo) => (
                  <RecentPhotoCard key={photo._id} photo={photo} />
                ))}
              </Grid>
            ) : (
              <Card padding={5} radius={3} tone="transparent" border>
                <Flex align="center" justify="center" direction="column" gap={3}>
                  <Text size={3} muted>
                    <ImageIcon />
                  </Text>
                  <Text size={1} muted align="center">
                    No photos yet. Use the quick actions above to add your first photo.
                  </Text>
                </Flex>
              </Card>
            )}
          </Stack>
        </Stack>
      </Container>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Plugin definition — dashboard is prepended so it appears first
// ---------------------------------------------------------------------------

export const dashboard = definePlugin({
  name: "dashboard",
  tools: (prev) => [
    {
      name: "dashboard",
      title: "Dashboard",
      icon: HomeIcon,
      component: DashboardTool,
    },
    ...prev,
  ],
});
