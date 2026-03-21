"use client";

import { useRouter } from "next/navigation";
import { BlogPostForm } from "@/components/forms/BlogPostForm";
import { useBlog } from "@/hooks/useBlog";
import type { BlogPost } from "@/lib/api";

export default function NewBlogPostPage() {
  const { createPost } = useBlog();
  const router = useRouter();

  const handleCreate = async (data: Partial<BlogPost>) => {
    await createPost(data);
    router.push("/blog");
  };

  return (
    <BlogPostForm
      title="New Blog Post"
      description="Write and publish a new post"
      onSubmit={handleCreate}
    />
  );
}