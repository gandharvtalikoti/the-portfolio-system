"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, ArrowLeft, Upload } from "lucide-react";
import { slugify } from "@/lib/utils";
import type { Project, MediaFile } from "@/lib/api";
import { FileUploader } from "./FileUploader";

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: Partial<Project>) => Promise<Project | void>;
  title: string;
  description: string;
}

const CATEGORIES = [
  { value: "photography", label: "Photography" },
  { value: "video",       label: "Video"       },
  { value: "design",      label: "Design"      },
  { value: "code",        label: "Code"        },
  { value: "other",       label: "Other"       },
] as const;

export function ProjectForm({
  initialData,
  onSubmit,
  title,
  description,
}: ProjectFormProps) {
  const router     = useRouter();
  const isEditMode = !!initialData;

  // ── Basic form fields ──
  const [projectTitle, setProjectTitle] = useState(initialData?.title || "");
  const [slug, setSlug]                 = useState(initialData?.slug || "");
  const [description2, setDescription]  = useState(initialData?.description || "");
  const [category, setCategory]         = useState(initialData?.category || "");
  const [tags, setTags]                 = useState(initialData?.tags || "");
  const [isPublished, setIsPublished]   = useState(initialData?.is_published || false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // ── UI state ──
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");

  // ── Media state ──
  // In edit mode: project already exists, use its id immediately
  // In create mode: null until form is submitted
  const [savedProjectId, setSavedProjectId] = useState<string | null>(
    initialData?.id || null
  );
  const [projectSaved, setProjectSaved] = useState<boolean>(
    isEditMode  // true immediately in edit mode
  );
  const [mediaFiles, setMediaFiles]     = useState<MediaFile[]>(
    initialData?.media_files || []
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    initialData?.thumbnail_url || null
  );

  // ── Auto-generate slug ──
  useEffect(() => {
    if (!slugManuallyEdited && projectTitle) {
      setSlug(slugify(projectTitle));
    }
  }, [projectTitle, slugManuallyEdited]);

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await onSubmit({
        title:        projectTitle,
        slug:         slug || slugify(projectTitle),
        description:  description2 || undefined,
        category:     category as Project["category"],
        tags:         tags,
        is_published: isPublished,
      });

      // result is the saved project returned from the API
      if (result && result.id) {
        setSavedProjectId(result.id);
        setProjectSaved(true);
        // stay on page so user can upload files
      } else {
        // edit mode — onSubmit might not return anything
        // project already exists so uploader is already shown
        setProjectSaved(true);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        "Failed to save project. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">

      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/projects")}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Card 1: Basic Info ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
            <CardDescription>
              The title and slug appear in the URL of your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Beach Photography Series"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                URL Slug
                <span className="text-muted-foreground font-normal ml-2 text-xs">
                  auto-generated from title
                </span>
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  /work/
                </span>
                <Input
                  id="slug"
                  placeholder="beach-photography-series"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  className="font-mono text-sm"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Full URL: yoursite.com/work/{slug || "your-slug-here"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell the story behind this project..."
                value={description2}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={isLoading}
              />
            </div>

          </CardContent>
        </Card>

        {/* ── Card 2: Category & Tags ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Classification</CardTitle>
            <CardDescription>
              Helps visitors filter and find your work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={isLoading}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">
                Tags
                <span className="text-muted-foreground font-normal ml-2 text-xs">
                  comma-separated
                </span>
              </Label>
              <Input
                id="tags"
                placeholder="e.g. nature, travel, 35mm"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                These help filter projects on your portfolio
              </p>
            </div>

          </CardContent>
        </Card>

        {/* ── Card 3: Publishing ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Publishing</CardTitle>
            <CardDescription>
              Drafts are only visible to you in the admin.
              Publish to show on your live portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => !isLoading && setIsPublished(!isPublished)}
            >
              <div className={`
                relative w-11 h-6 rounded-full transition-colors duration-200
                ${isPublished ? "bg-slate-900" : "bg-slate-200"}
              `}>
                <div className={`
                  absolute top-1 w-4 h-4 bg-white rounded-full
                  shadow transition-transform duration-200
                  ${isPublished ? "translate-x-6" : "translate-x-1"}
                `} />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isPublished
                    ? "Published — visible on portfolio"
                    : "Draft — hidden from portfolio"
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isPublished ? "Click to unpublish" : "Click to publish"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>


                    {/* ── Action Buttons ── */}
        {/*
          Before save: show "Create Project" + "Cancel"
          After save:  show "Update Details" + "Done → Back to Projects"
        */}
        <div className="flex items-center gap-3 pb-8">
          {!projectSaved ? (
            <>
              <Button
                type="submit"
                disabled={isLoading || !projectTitle || !category}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/projects")}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              {/* In saved state: update details button */}
              <Button
                type="submit"
                variant="outline"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update Details"
                )}
              </Button>
              {/* Done button goes back to list */}
              <Button
                type="button"
                onClick={() => router.push("/projects")}
              >
                Done — Back to Projects
              </Button>
            </>
          )}
        </div>

        {/* ── Card 4: Media Files ── */}
        {/*
          Show uploader if:
          - Edit mode (project already exists) OR
          - Create mode AND project was just saved

          Show "save first" message only in create mode
          before the form has been submitted
        */}
        {projectSaved && savedProjectId ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Media Files</CardTitle>
              <CardDescription>
                Upload photos, videos or PDFs for this project.
                The first image automatically becomes the cover.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader
                projectId={savedProjectId}
                existingFiles={mediaFiles}
                thumbnailUrl={thumbnailUrl}
                onUploadDone={(file) => {
                  setMediaFiles((prev) => [...prev, file]);
                  if (!thumbnailUrl && file.file_type === "image") {
                    setThumbnailUrl(file.public_url);
                  }
                }}
                onDeleteDone={(fileId) => {
                  setMediaFiles((prev) =>
                    prev.filter((f) => f.id !== fileId)
                  );
                }}
                onThumbnailSet={(url) => {
                  setThumbnailUrl(url);
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="pt-0">
              <div className="text-center py-6 space-y-2">
                <Upload className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-sm font-medium text-slate-500">
                  Media Files
                </p>
                <p className="text-xs text-muted-foreground">
                  Fill in the title and category above,
                  then click Create Project to unlock file uploads.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

      

      </form>
    </div>
  );
}