"use client";

/**
 * BlogPostForm.tsx — Shared form for create and edit blog posts.
 *
 * New concept vs ProjectForm:
 * - Markdown textarea for content
 * - Live preview toggle (write vs see rendered)
 * - Excerpt field (short summary for listing page)
 */

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
  Loader2,
  AlertCircle,
  ArrowLeft,
  Eye,
  Code,
} from "lucide-react";
import { slugify } from "@/lib/utils";
import type { BlogPost } from "@/lib/api";

interface BlogPostFormProps {
  initialData?: BlogPost;
  onSubmit: (data: Partial<BlogPost>) => Promise<void>;
  title: string;
  description: string;
}

export function BlogPostForm({
  initialData,
  onSubmit,
  title,
  description,
}: BlogPostFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;

  // ── Form state ──
  const [postTitle, setPostTitle]     = useState(initialData?.title || "");
  const [slug, setSlug]               = useState(initialData?.slug || "");
  const [content, setContent]         = useState(initialData?.content || "");
  const [excerpt, setExcerpt]         = useState(initialData?.excerpt || "");
  const [isPublished, setIsPublished] = useState(initialData?.is_published || false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // controls whether we show the raw markdown or a preview
  const [showPreview, setShowPreview] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");

  // auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && postTitle) {
      setSlug(slugify(postTitle));
    }
  }, [postTitle, slugManuallyEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await onSubmit({
        title:        postTitle,
        slug:         slug || slugify(postTitle),
        content:      content,
        excerpt:      excerpt || undefined,
        is_published: isPublished,
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        "Failed to save post. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/blog")}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Card 1: Post Info ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Post Details</CardTitle>
            <CardDescription>
              Title and excerpt appear on the blog listing page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. What I Learned Building a Portfolio"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">
                URL Slug
                <span className="text-muted-foreground font-normal ml-2 text-xs">
                  auto-generated from title
                </span>
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  /blog/
                </span>
                <Input
                  id="slug"
                  placeholder="what-i-learned-building-a-portfolio"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  className="font-mono text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">
                Excerpt
                <span className="text-muted-foreground font-normal ml-2 text-xs">
                  short preview shown on blog listing
                </span>
              </Label>
              <Textarea
                id="excerpt"
                placeholder="A one or two sentence summary of this post..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                disabled={isLoading}
              />
            </div>

          </CardContent>
        </Card>

        {/* ── Card 2: Content Editor ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Content</CardTitle>
              <CardDescription>
                Write in Markdown — headings, bold, lists, links all work
              </CardDescription>
            </div>

            {/* Toggle between write and preview mode */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <>
                  <Code className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Preview
                </>
              )}
            </Button>
          </CardHeader>

          <CardContent>
            {showPreview ? (
              /*
               * Simple preview — shows formatted markdown visually.
               *
               * In a later phase we can add react-markdown here
               * to render it as actual HTML (bold, headings etc).
               * For now, whitespace-pre-wrap shows the structure.
               */
              <div className="min-h-[400px] p-4 border rounded-md bg-slate-50 text-sm leading-relaxed">
                {content ? (
                  <pre className="whitespace-pre-wrap font-sans">
                    {content}
                  </pre>
                ) : (
                  <p className="text-muted-foreground italic">
                    Nothing to preview yet. Switch back to Edit and start writing.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  placeholder={`Write your post in Markdown...

# Main Heading

Introduce your topic here.

## Section Title

Your content goes here. You can use **bold**, *italic*, and [links](https://example.com).

- Bullet point one
- Bullet point two

## Another Section

Keep writing...`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="font-mono text-sm resize-y"
                  required
                  disabled={isLoading}
                />

                {/* Markdown cheatsheet */}
                <div className="text-xs text-muted-foreground bg-slate-50 rounded-md p-3 space-y-1">
                  <p className="font-medium text-slate-600 mb-2">
                    Markdown cheatsheet:
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
                    <span># Heading 1</span>
                    <span>**bold text**</span>
                    <span>## Heading 2</span>
                    <span>*italic text*</span>
                    <span>- bullet item</span>
                    <span>[link text](url)</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Card 3: Publishing ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Publishing</CardTitle>
            <CardDescription>
              Drafts are private. Publish to show on your portfolio blog.
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Actions ── */}
        <div className="flex items-center gap-3 pb-8">
          <Button
            type="submit"
            disabled={isLoading || !postTitle || !content}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEditMode ? (
              "Save Changes"
            ) : (
              "Create Post"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/blog")}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>

      </form>
    </div>
  );
}