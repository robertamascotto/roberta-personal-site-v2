import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useClient } from "sanity";
import {
  Card,
  Stack,
  Button,
  Flex,
  Text,
  Select,
  Box,
  useToast,
  Checkbox,
  TextInput,
  Label,
  Inline,
  Badge,
} from "@sanity/ui";
import { UploadIcon, TrashIcon } from "@sanity/icons";
import { CATEGORIES } from "@/lib/constants";
import { createTag } from "../lib/helpers";
import { apiVersion } from "../env";

interface PendingPhoto {
  id: string;
  file: File;
  preview: string;
  alt: string;
  tagIds: string[];
}

interface Tag {
  _id: string;
  label: string;
}

export function BulkImport() {
  const client = useClient({ apiVersion });
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState("");
  const [sharedTagIds, setSharedTagIds] = useState<Set<string>>(new Set());
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [dragging, setDragging] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);

  useEffect(() => {
    client
      .fetch<Tag[]>('*[_type == "tag"] | order(orderRank asc, sortOrder asc) { _id, label }')
      .then(setAvailableTags);
  }, [client]);

  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return availableTags;
    const q = tagSearch.toLowerCase();
    return availableTags.filter((t) => t.label.toLowerCase().includes(q));
  }, [availableTags, tagSearch]);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const images = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/")
    );
    const newPending: PendingPhoto[] = images.map((file) => ({
      id: Math.random().toString(36).slice(2, 10),
      file,
      preview: URL.createObjectURL(file),
      alt: file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      tagIds: [],
    }));
    setPending((prev) => [...prev, ...newPending]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeFile = (id: string) => {
    setPending((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const updateAlt = (id: string, alt: string) => {
    setPending((prev) => prev.map((p) => (p.id === id ? { ...p, alt } : p)));
  };

  const toggleSharedTag = (tagId: string) => {
    setSharedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const togglePhotoTag = (photoId: string, tagId: string) => {
    setPending((prev) =>
      prev.map((p) => {
        if (p.id !== photoId) return p;
        const tagIds = p.tagIds.includes(tagId)
          ? p.tagIds.filter((id) => id !== tagId)
          : [...p.tagIds, tagId];
        return { ...p, tagIds };
      })
    );
  };

  const getEffectiveTags = (photo: PendingPhoto): string[] => {
    const combined = new Set(sharedTagIds);
    for (const id of photo.tagIds) combined.add(id);
    return Array.from(combined);
  };

  const handleImport = async () => {
    if (!category) {
      toast.push({ status: "warning", title: "Please select a category" });
      return;
    }
    if (pending.length === 0) {
      toast.push({ status: "warning", title: "No photos to import" });
      return;
    }

    setImporting(true);
    setProgress({ current: 0, total: pending.length });

    let succeeded = 0;
    for (let i = 0; i < pending.length; i++) {
      setProgress({ current: i + 1, total: pending.length });
      try {
        const effectiveTags = getEffectiveTags(pending[i]);
        const asset = await client.assets.upload("image", pending[i].file, {
          filename: pending[i].file.name,
        });
        await client.create({
          _type: "photo",
          image: {
            _type: "image",
            asset: { _type: "reference", _ref: asset._id },
          },
          alt: pending[i].alt || "Untitled",
          category,
          tags: effectiveTags.map((tagId) => ({
            _type: "reference",
            _ref: tagId,
            _key: Math.random().toString(36).slice(2, 10),
          })),
          date: new Date().toISOString().split("T")[0],
          featured: false,
        });
        succeeded++;
      } catch (err) {
        console.error(`Failed to import ${pending[i].file.name}:`, err);
        toast.push({
          status: "error",
          title: `Failed: ${pending[i].file.name}`,
        });
      }
    }

    pending.forEach((p) => URL.revokeObjectURL(p.preview));
    setPending([]);
    setImporting(false);
    setProgress({ current: 0, total: 0 });
    toast.push({
      status: succeeded === pending.length ? "success" : "warning",
      title: `Imported ${succeeded} of ${pending.length} photos`,
      description: "Go to Photos in the sidebar to view them.",
    });
  };

  const clearAll = () => {
    pending.forEach((p) => URL.revokeObjectURL(p.preview));
    setPending([]);
  };

  const handleCreateTag = async () => {
    const label = newTagName.trim();
    if (!label) return;
    setCreatingTag(true);
    try {
      const tag = await createTag(client, label);
      setAvailableTags((prev) => [...prev, tag]);
      setSharedTagIds((prev) => new Set([...prev, tag._id]));
      setNewTagName("");
      toast.push({ status: "success", title: `Created tag "${label}"` });
    } catch (err) {
      console.error("Failed to create tag:", err);
      toast.push({ status: "error", title: "Failed to create tag" });
    }
    setCreatingTag(false);
  };

  const getTagLabel = (tagId: string) =>
    availableTags.find((t) => t._id === tagId)?.label ?? tagId;

  return (
    <Stack space={5}>
      {/* Category */}
      <Stack space={3}>
        <Label size={1}>Category *</Label>
        <Select
          value={category}
          onChange={(e) =>
            setCategory((e.target as HTMLSelectElement).value)
          }
          disabled={importing}
        >
          <option value="">Select a category...</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </Select>
      </Stack>

      {/* Shared Tags */}
      {availableTags.length > 0 && (
        <Stack space={3}>
          <Label size={1}>Tags for all photos</Label>
          <Text size={0} muted>
            These tags are applied to every photo. You can also add per-photo tags below.
          </Text>
          {availableTags.length > 5 && (
            <TextInput
              placeholder="Search tags..."
              value={tagSearch}
              onChange={(e) =>
                setTagSearch((e.target as HTMLInputElement).value)
              }
              fontSize={1}
              disabled={importing}
            />
          )}
          <Inline space={2}>
            {filteredTags.map((tag) => (
              <Card
                key={tag._id}
                as="label"
                padding={2}
                radius={2}
                tone={
                  sharedTagIds.has(tag._id) ? "primary" : "default"
                }
                border
                style={{ cursor: "pointer" }}
              >
                <Flex align="center" gap={2}>
                  <Checkbox
                    checked={sharedTagIds.has(tag._id)}
                    onChange={() => toggleSharedTag(tag._id)}
                    disabled={importing}
                  />
                  <Text size={1}>{tag.label}</Text>
                </Flex>
              </Card>
            ))}
          </Inline>
          <Stack space={2}>
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
                disabled={importing || creatingTag}
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
                disabled={importing || creatingTag || !newTagName.trim()}
              />
            </Flex>
          </Stack>
        </Stack>
      )}

      {/* Drop Zone */}
      <Card
        padding={5}
        radius={2}
        tone={dragging ? "primary" : "transparent"}
        border
        style={{
          borderStyle: "dashed",
          cursor: importing ? "default" : "pointer",
          textAlign: "center",
        }}
        onDragOver={(e: React.DragEvent) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !importing && fileInputRef.current?.click()}
      >
        <Stack space={3}>
          <Text align="center" size={4} muted>
            <UploadIcon />
          </Text>
          <Text align="center" size={1} muted>
            {dragging
              ? "Drop images here"
              : "Drag & drop images here, or click to browse"}
          </Text>
        </Stack>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </Card>

      {/* Preview Grid */}
      {pending.length > 0 && (
        <Stack space={4}>
          <Flex align="center" justify="space-between">
            <Text size={1} weight="semibold">
              {pending.length} photo{pending.length !== 1 ? "s" : ""} ready to
              import
            </Text>
            <Button
              text="Clear All"
              tone="critical"
              mode="ghost"
              fontSize={1}
              onClick={clearAll}
              disabled={importing}
            />
          </Flex>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "12px",
            }}
          >
            {pending.map((item) => {
              const effectiveTags = getEffectiveTags(item);
              return (
                <Card key={item.id} border radius={2} overflow="hidden">
                  <div style={{ position: "relative" }}>
                    <img
                      src={item.preview}
                      alt={item.alt}
                      style={{
                        width: "100%",
                        height: "160px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    {!importing && (
                      <Button
                        icon={TrashIcon}
                        mode="ghost"
                        tone="critical"
                        fontSize={1}
                        padding={2}
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          background: "rgba(255,255,255,0.85)",
                          borderRadius: "4px",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(item.id);
                        }}
                      />
                    )}
                  </div>
                  <Box padding={2}>
                    <Stack space={2}>
                      <TextInput
                        value={item.alt}
                        onChange={(e) =>
                          updateAlt(
                            item.id,
                            (e.target as HTMLInputElement).value
                          )
                        }
                        placeholder="Alt text"
                        fontSize={1}
                        disabled={importing}
                      />
                      {/* Per-photo tags */}
                      {availableTags.length > 0 && (
                        <Flex gap={1} wrap="wrap">
                          {availableTags.map((tag) => {
                            const isShared = sharedTagIds.has(tag._id);
                            const isLocal = item.tagIds.includes(tag._id);
                            return (
                              <Badge
                                key={tag._id}
                                fontSize={0}
                                tone={isShared || isLocal ? "primary" : "default"}
                                mode={isShared ? "default" : "outline"}
                                radius={2}
                                style={{
                                  cursor: importing || isShared ? "default" : "pointer",
                                  opacity: isShared ? 0.7 : 1,
                                }}
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  if (!importing && !isShared) {
                                    togglePhotoTag(item.id, tag._id);
                                  }
                                }}
                              >
                                {tag.label}
                              </Badge>
                            );
                          })}
                        </Flex>
                      )}
                      {/* Show effective tag summary */}
                      {effectiveTags.length > 0 && (
                        <Text size={0} muted>
                          {effectiveTags.length} tag{effectiveTags.length !== 1 ? "s" : ""}: {effectiveTags.map(getTagLabel).join(", ")}
                        </Text>
                      )}
                    </Stack>
                  </Box>
                </Card>
              );
            })}
          </div>

          {/* Import Button */}
          <Button
            text={
              importing
                ? `Importing ${progress.current} / ${progress.total}...`
                : `Import ${pending.length} Photo${pending.length !== 1 ? "s" : ""}`
            }
            tone="positive"
            icon={importing ? undefined : UploadIcon}
            onClick={handleImport}
            disabled={importing || !category}
          />
        </Stack>
      )}
    </Stack>
  );
}
