"use client";

import { use }            from "react";
import { useRouter }      from "next/navigation";
import { useBlog }        from "@/hooks/useBlog";
import { BlogPostForm }   from "@/components/forms/BlogPostForm";
import { Loader2 }        from "lucide-react";
import type { BlogPost }  from "@/lib/api";

export default function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }                      = use(params);
  const { posts, isLoading, updatePost } = useBlog();
  const router                      = useRouter();

  const post = posts.find((p) => p.id === id);

  const handleUpdate = async (data: Partial<BlogPost>): Promise<void> => {
    await updatePost(id, data);
    router.push("/blog");
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
