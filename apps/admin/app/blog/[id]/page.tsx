"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useBlog } from "@/hooks/useBlog";
import { BlogPostForm } from "@/components/forms/BlogPostForm";
import { Loader2 } from "lucide-react";
import type { BlogPost } from "@/lib/api";

export default function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Unwrap params Promise
  const { id } = use(params);

  const { posts, isLoading, updatePost } = useBlog();
  const router = useRouter();

  const post = posts.find((p) => p.id === id);

  const handleUpdate = async (data: Partial<BlogPost>) => {
    const result = await updatePost(id, data);
    return result;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Post not found.</p>
      </div>
    );
  }

  return (
    <BlogPostForm
      title="Edit Post"
      description={`Editing: ${post.title}`}
      initialData={post}
      onSubmit={handleUpdate}
    />
  );
}
// ```

// ---

// ## What changed and why
// ```
// Next.js 14:
//   params = { id: "abc-123" }        ← plain object, access directly
//   params.id = "abc-123"             ← works fine

// Next.js 15 (what you have):
//   params = Promise<{ id: "abc-123" }> ← wrapped in Promise
//   params.id = undefined               ← Promise has no .id property!
  
//   Fix: const { id } = use(params)   ← React.use() unwraps the Promise
//                                        synchronously during render