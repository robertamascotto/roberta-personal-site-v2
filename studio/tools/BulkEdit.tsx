import { useState, useEffect, useCallback, useMemo } from "react";
import { useClient } from "sanity";
import {
  Card,
  Stack,
  Button,
  Flex,
  Text,
  Select,
  Box,
  Spinner,
  useToast,
  Checkbox,
  Dialog,
  Badge,
  TextInput,
} from "@sanity/ui";
import { TrashIcon, TagIcon, StarIcon, CalendarIcon, TransferIcon } from "@sanity/icons";
import { CATEGORIES, getCategoryLabel } from "@/lib/constants";
import { createTag, categoryTone } from "../lib/helpers";
import { apiVersion } from "../env";

interface Photo {
  _id: string;
  alt: string;
  category: string;
  featured: boolean;
  imageUrl: string;
  tags: { _id: string; label: string }[] | null;
}

interface Tag {
  _id: string;
  label: string;
}

export function BulkEdit() {
  const client = useClient({ apiVersion });
  const toast = useToast();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState(false);

  const [tagDialog, setTagDialog] = useState<"add" | "remove" | null>(null);
  const [dialogTagIds, setDialogTagIds] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [dateDialog, setDateDialog] = useState(false);
  const [dateValue, setDateValue] = useState("");
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [featuredDialog, setFeaturedDialog] = useState<"set" | "unset" | null>(null);

  const fetchPhotos = useCallback(async (clearSelection = false) => {
    setLoading(true);
    const filter = categoryFilter
      ? `_type == "photo" && category == $category`
      : `_type == "photo"`;
    const result = await client.fetch<Photo[]>(
      `*[${filter}] | order(date desc) { _id, alt, category, featured, "imageUrl": image.asset->url, "tags": tags[@->_id != null]->{ _id, label } }`,
      categoryFilter ? { category: categoryFilter } : {}
    );
    setPhotos(result);
    if (clearSelection) {
      setSelectedIds(new Set());
    } else {
      // Prune selected IDs that no longer exist (e.g. after delete or category move)
      const resultIds = new Set(result.map((p) => p._id));
      setSelectedIds((prev) => {
        const pruned = new Set([...prev].filter((id) => resultIds.has(id)));
        return pruned.size === prev.size ? prev : pruned;
      });
    }
    setLoading(false);
  }, [client, categoryFilter]);

  useEffect(() => {
    fetchPhotos(true);
    client
      .fetch<Tag[]>('*[_type == "tag"] | order(orderRank asc, sortOrder asc) { _id, label }')
      .then(setTags);
  }, [fetchPhotos, client]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === photos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(photos.map((p) => p._id)));
    }
  };

  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return tags;
    const q = tagSearch.toLowerCase();
    return tags.filter((t) => t.label.toLowerCase().includes(q));
  }, [tags, tagSearch]);

  const handleCreateTag = async () => {
    const label = newTagName.trim();
    if (!label) return;
    setCreatingTag(true);
    try {
      const tag = await createTag(client, label);
      setTags((prev) => [...prev, tag]);
      setDialogTagIds((prev) => [...prev, tag._id]);
      setNewTagName("");
      toast.push({ status: "success", title: `Created tag "${label}"` });
    } catch (err) {
      console.error("Failed to create tag:", err);
      toast.push({ status: "error", title: "Failed to create tag" });
    }
    setCreatingTag(false);
  };

  const handleAddTags = async () => {
    if (dialogTagIds.length === 0) return;
    setApplying(true);
    try {
      const transaction = client.transaction();
      for (const id of selectedIds) {
        const photo = photos.find((p) => p._id === id);
        const existingTagIds = photo?.tags?.map((t) => t._id) || [];
        const newRefs = dialogTagIds
          .filter((tagId) => !existingTagIds.includes(tagId))
          .map((tagId) => ({
            _type: "reference" as const,
            _ref: tagId,
            _key: Math.random().toString(36).slice(2, 10),
          }));
        if (newRefs.length > 0) {
          transaction.patch(id, (p) =>
            p.setIfMissing({ tags: [] }).insert("after", "tags[-1]", newRefs)
          );
        }
      }
      await transaction.commit();
      toast.push({
        status: "success",
        title: `Added tags to ${selectedIds.size} photos`,
      });
    } catch (err) {
      console.error(err);
      toast.push({ status: "error", title: "Failed to add tags" });
    }
    setApplying(false);
    setTagDialog(null);
    setDialogTagIds([]);
    setTagSearch("");
    fetchPhotos();
  };

  const handleRemoveTags = async () => {
    if (dialogTagIds.length === 0) return;
    setApplying(true);
    try {
      const transaction = client.transaction();
      for (const id of selectedIds) {
        transaction.patch(id, (p) =>
          p.unset(dialogTagIds.map((tagId) => `tags[_ref=="${tagId}"]`))
        );
      }
      await transaction.commit();
      toast.push({
        status: "success",
        title: `Removed tags from ${selectedIds.size} photos`,
      });
    } catch (err) {
      console.error(err);
      toast.push({ status: "error", title: "Failed to remove tags" });
    }
    setApplying(false);
    setTagDialog(null);
    setDialogTagIds([]);
    setTagSearch("");
    fetchPhotos();
  };

  const handleToggleFeatured = async (value: boolean) => {
    setApplying(true);
    try {
      const transaction = client.transaction();
      for (const id of selectedIds) {
        transaction.patch(id, (p) => p.set({ featured: value }));
      }
      await transaction.commit();
      toast.push({
        status: "success",
        title: `${value ? "Featured" : "Unfeatured"} ${selectedIds.size} photos`,
      });
    } catch (err) {
      console.error(err);
      toast.push({ status: "error", title: "Failed to update photos" });
    }
    setApplying(false);
    fetchPhotos();
  };

  const handleSetDate = async () => {
    if (!dateValue) return;
    setApplying(true);
    try {
      const transaction = client.transaction();
      for (const id of selectedIds) {
        transaction.patch(id, (p) => p.set({ date: dateValue }));
      }
      await transaction.commit();
      toast.push({
        status: "success",
        title: `Set date on ${selectedIds.size} photos`,
      });
    } catch (err) {
      console.error(err);
      toast.push({ status: "error", title: "Failed to set date" });
    }
    setApplying(false);
    setDateDialog(false);
    setDateValue("");
    fetchPhotos();
  };

  const handleChangeCategory = async () => {
    if (!newCategory) return;
    setApplying(true);
    try {
      const transaction = client.transaction();
      for (const id of selectedIds) {
        transaction.patch(id, (p) => p.set({ category: newCategory }));
      }
      await transaction.commit();
      const label = getCategoryLabel(newCategory);
      toast.push({
        status: "success",
        title: `Moved ${selectedIds.size} photos to ${label}`,
      });
    } catch (err) {
      console.error(err);
      toast.push({ status: "error", title: "Failed to move photos" });
    }
    setApplying(false);
    setCategoryDialog(false);
    setNewCategory("");
    fetchPhotos();
  };

  const handleDelete = async () => {
    setApplying(true);
    try {
      const transaction = client.transaction();
      for (const id of selectedIds) {
        transaction.delete(id);
      }
      await transaction.commit();
      toast.push({
        status: "success",
        title: `Deleted ${selectedIds.size} photos`,
      });
    } catch (err) {
      console.error(err);
      toast.push({ status: "error", title: "Failed to delete photos" });
    }
    setApplying(false);
    setDeleteDialog(false);
    fetchPhotos();
  };

  const allSelected = photos.length > 0 && selectedIds.size === photos.length;

  if (loading) {
    return (
      <Flex align="center" justify="center" padding={6}>
        <Spinner muted />
      </Flex>
    );
  }

  return (
    <Stack space={4}>
      {/* Toolbar */}
      <Flex align="center" gap={3} wrap="wrap">
        <Select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter((e.target as HTMLSelectElement).value)
          }
          style={{ maxWidth: 200 }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </Select>

        <Button
          text={allSelected ? "Deselect All" : "Select All"}
          mode="ghost"
          onClick={selectAll}
          disabled={photos.length === 0}
          fontSize={1}
        />

        {selectedIds.size > 0 && (
          <>
            <Badge tone="primary">{selectedIds.size} selected</Badge>
            <Button
              text="Add Tags"
              icon={TagIcon}
              mode="ghost"
              tone="primary"
              fontSize={1}
              onClick={() => {
                setDialogTagIds([]);
                setTagSearch("");
                setTagDialog("add");
              }}
              disabled={applying}
            />
            <Button
              text="Remove Tags"
              icon={TagIcon}
              mode="ghost"
              tone="caution"
              fontSize={1}
              onClick={() => {
                setDialogTagIds([]);
                setTagSearch("");
                setTagDialog("remove");
              }}
              disabled={applying}
            />
            <Button
              text="Set Date"
              icon={CalendarIcon}
              mode="ghost"
              fontSize={1}
              onClick={() => {
                setDateValue(new Date().toISOString().split("T")[0]);
                setDateDialog(true);
              }}
              disabled={applying}
            />
            <Button
              text="Move Category"
              icon={TransferIcon}
              mode="ghost"
              fontSize={1}
              onClick={() => {
                setNewCategory("");
                setCategoryDialog(true);
              }}
              disabled={applying}
            />
            <Button
              text="Set Featured"
              icon={StarIcon}
              mode="ghost"
              fontSize={1}
              onClick={() => setFeaturedDialog("set")}
              disabled={applying}
            />
            <Button
              text="Unset Featured"
              icon={StarIcon}
              mode="ghost"
              tone="caution"
              fontSize={1}
              onClick={() => setFeaturedDialog("unset")}
              disabled={applying}
            />
            <Button
              text="Delete"
              icon={TrashIcon}
              mode="ghost"
              tone="critical"
              fontSize={1}
              onClick={() => setDeleteDialog(true)}
              disabled={applying}
            />
          </>
        )}
      </Flex>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <Card padding={5} border radius={2}>
          <Text align="center" muted>
            No photos found
          </Text>
        </Card>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "8px",
          }}
        >
          {photos.map((photo) => (
            <Card
              key={photo._id}
              border
              radius={2}
              overflow="hidden"
              tone={selectedIds.has(photo._id) ? "primary" : "default"}
              style={{ cursor: "pointer" }}
              onClick={() => toggleSelect(photo._id)}
            >
              <div style={{ position: "relative" }}>
                {photo.imageUrl ? (
                  <img
                    src={`${photo.imageUrl}?w=300&h=200&fit=crop`}
                    alt={photo.alt}
                    style={{
                      width: "100%",
                      height: "140px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "140px",
                      background: "var(--card-bg2-color, #eee)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text size={0} muted>
                      No image
                    </Text>
                  </div>
                )}
                <div style={{ position: "absolute", top: 6, left: 6 }}>
                  <Checkbox
                    checked={selectedIds.has(photo._id)}
                    readOnly
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      borderRadius: "3px",
                    }}
                  />
                </div>
                {photo.featured && (
                  <Badge
                    tone="caution"
                    fontSize={0}
                    style={{ position: "absolute", top: 6, right: 6 }}
                  >
                    Featured
                  </Badge>
                )}
              </div>
              <Box padding={2}>
                <Text size={1} textOverflow="ellipsis">
                  {photo.alt || "No alt text"}
                </Text>
                <Flex gap={1} marginTop={1} wrap="wrap" align="center">
                  <Badge
                    fontSize={0}
                    tone={categoryTone(photo.category)}
                  >
                    {getCategoryLabel(photo.category)}
                  </Badge>
                  {photo.tags && photo.tags.map((tag) => (
                    <Badge key={tag._id} fontSize={0} mode="outline">
                      {tag.label}
                    </Badge>
                  ))}
                </Flex>
              </Box>
            </Card>
          ))}
        </div>
      )}

      {/* Tag Dialog */}
      {tagDialog && (
        <Dialog
          id="tag-dialog"
          header={tagDialog === "add" ? "Add Tags" : "Remove Tags"}
          onClose={() => setTagDialog(null)}
          width={1}
        >
          <Box padding={4}>
            <Stack space={3}>
              <Text size={1} muted>
                Select tags to {tagDialog === "add" ? "add to" : "remove from"}{" "}
                {selectedIds.size} photo
                {selectedIds.size !== 1 ? "s" : ""}
              </Text>
              {tags.length > 5 && (
                <TextInput
                  placeholder="Search tags..."
                  value={tagSearch}
                  onChange={(e) =>
                    setTagSearch((e.target as HTMLInputElement).value)
                  }
                  fontSize={1}
                />
              )}
              {filteredTags.map((tag) => (
                <Card
                  key={tag._id}
                  as="label"
                  padding={2}
                  radius={2}
                  border
                  style={{ cursor: "pointer" }}
                >
                  <Flex align="center" gap={2}>
                    <Checkbox
                      checked={dialogTagIds.includes(tag._id)}
                      onChange={() =>
                        setDialogTagIds((prev) =>
                          prev.includes(tag._id)
                            ? prev.filter((id) => id !== tag._id)
                            : [...prev, tag._id]
                        )
                      }
                    />
                    <Text size={1}>{tag.label}</Text>
                  </Flex>
                </Card>
              ))}
              {filteredTags.length === 0 && (
                <Text size={1} muted>No tags match &ldquo;{tagSearch}&rdquo;</Text>
              )}
              {tagDialog === "add" && (
                <Stack space={2} marginTop={2}>
                  <Text size={0} muted weight="semibold">
                    Don&apos;t see the tag you need?
                  </Text>
                  <Flex gap={2} align="center">
                    <TextInput
                      placeholder="Type a new tag name..."
                      value={newTagName}
                      onChange={(e) =>
                        setNewTagName((e.target as HTMLInputElement).value)
                      }
                      fontSize={1}
                      disabled={creatingTag}
                      style={{ flex: 1 }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateTag();
                        }
                      }}
                    />
                    <Button
                      text={creatingTag ? "Creating..." : "Create Tag"}
                      tone="primary"
                      mode="ghost"
                      fontSize={1}
                      onClick={handleCreateTag}
                      disabled={creatingTag || !newTagName.trim()}
                    />
                  </Flex>
                </Stack>
              )}
            </Stack>
          </Box>
          <Card padding={3} borderTop>
            <Flex justify="flex-end" gap={2}>
              <Button
                text="Cancel"
                mode="ghost"
                onClick={() => setTagDialog(null)}
              />
              <Button
                text={tagDialog === "add" ? "Add Tags" : "Remove Tags"}
                tone={tagDialog === "add" ? "primary" : "caution"}
                onClick={
                  tagDialog === "add" ? handleAddTags : handleRemoveTags
                }
                disabled={dialogTagIds.length === 0 || applying}
              />
            </Flex>
          </Card>
        </Dialog>
      )}

      {/* Date Dialog */}
      {dateDialog && (
        <Dialog
          id="date-dialog"
          header="Set Date"
          onClose={() => setDateDialog(false)}
          width={1}
        >
          <Box padding={4}>
            <Stack space={3}>
              <Text size={1} muted>
                Set the date for {selectedIds.size} photo
                {selectedIds.size !== 1 ? "s" : ""}
              </Text>
              <input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                style={{
                  padding: "8px 12px",
                  fontSize: "14px",
                  border: "1px solid var(--card-border-color, #ccc)",
                  borderRadius: "4px",
                  background: "var(--card-bg-color, #fff)",
                  color: "inherit",
                  width: "100%",
                }}
              />
            </Stack>
          </Box>
          <Card padding={3} borderTop>
            <Flex justify="flex-end" gap={2}>
              <Button
                text="Cancel"
                mode="ghost"
                onClick={() => setDateDialog(false)}
              />
              <Button
                text="Set Date"
                tone="primary"
                onClick={handleSetDate}
                disabled={!dateValue || applying}
              />
            </Flex>
          </Card>
        </Dialog>
      )}

      {/* Category Dialog */}
      {categoryDialog && (
        <Dialog
          id="category-dialog"
          header="Move to Category"
          onClose={() => setCategoryDialog(false)}
          width={1}
        >
          <Box padding={4}>
            <Stack space={3}>
              <Text size={1} muted>
                Move {selectedIds.size} photo
                {selectedIds.size !== 1 ? "s" : ""} to a different category
              </Text>
              <Select
                value={newCategory}
                onChange={(e) =>
                  setNewCategory((e.target as HTMLSelectElement).value)
                }
              >
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Stack>
          </Box>
          <Card padding={3} borderTop>
            <Flex justify="flex-end" gap={2}>
              <Button
                text="Cancel"
                mode="ghost"
                onClick={() => setCategoryDialog(false)}
              />
              <Button
                text="Move Photos"
                tone="primary"
                onClick={handleChangeCategory}
                disabled={!newCategory || applying}
              />
            </Flex>
          </Card>
        </Dialog>
      )}

      {/* Featured Confirmation */}
      {featuredDialog !== null && (
        <Dialog
          id="featured-dialog"
          header={featuredDialog === "set" ? "Set Featured" : "Unset Featured"}
          onClose={() => setFeaturedDialog(null)}
          width={1}
        >
          <Box padding={4}>
            <Text>
              {featuredDialog === "set"
                ? `Pin ${selectedIds.size} photo${selectedIds.size !== 1 ? "s" : ""} to the top of the portfolio grid?`
                : `Remove featured status from ${selectedIds.size} photo${selectedIds.size !== 1 ? "s" : ""}?`}
            </Text>
          </Box>
          <Card padding={3} borderTop>
            <Flex justify="flex-end" gap={2}>
              <Button
                text="Cancel"
                mode="ghost"
                onClick={() => setFeaturedDialog(null)}
              />
              <Button
                text={featuredDialog === "set" ? "Set Featured" : "Unset Featured"}
                tone={featuredDialog === "set" ? "primary" : "caution"}
                onClick={() => {
                  handleToggleFeatured(featuredDialog === "set");
                  setFeaturedDialog(null);
                }}
                disabled={applying}
              />
            </Flex>
          </Card>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      {deleteDialog && (
        <Dialog
          id="delete-dialog"
          header="Delete Photos"
          onClose={() => setDeleteDialog(false)}
          width={1}
        >
          <Box padding={4}>
            <Text>
              Are you sure you want to delete {selectedIds.size} photo
              {selectedIds.size !== 1 ? "s" : ""}? This cannot be undone.
            </Text>
          </Box>
          <Card padding={3} borderTop>
            <Flex justify="flex-end" gap={2}>
              <Button
                text="Cancel"
                mode="ghost"
                onClick={() => setDeleteDialog(false)}
              />
              <Button
                text={`Delete ${selectedIds.size} Photo${selectedIds.size !== 1 ? "s" : ""}`}
                tone="critical"
                onClick={handleDelete}
                disabled={applying}
              />
            </Flex>
          </Card>
        </Dialog>
      )}
    </Stack>
  );
}
