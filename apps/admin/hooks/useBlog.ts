"use client";

/**
 * useBlog.ts — Same pattern as useProjects.
 * Fetch, create, update, delete blog posts.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getAdminPosts,
  createPost as apiCreate,
  updatePost as apiUpdate,
  deletePost as apiDelete,
  type BlogPost,
} from "@/lib/api";

export function useBlog() {
  const [posts, setPosts]         = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAdminPosts();
      setPosts(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Failed to load posts"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (payload: Partial<BlogPost>) => {
    const newPost = await apiCreate(payload);
    setPosts((prev) => [newPost, ...prev]);
    return newPost;
  };

  const updatePost = async (id: string, payload: Partial<BlogPost>) => {
    const updated = await apiUpdate(id, payload);
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? updated : p))
    );
    return updated;
  };

  const deletePost = async (id: string) => {
    await apiDelete(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    posts,
    isLoading,
    error,
    refetch: fetchPosts,
    createPost,
    updatePost,
    deletePost,
  };
}


// ---

// ### Step 13b — BlogPostForm component

// One new concept here: the **Markdown editor with preview**.

// What is Markdown?
// ```
// // You write this:          Renders as this in the browser:
// // ──────────────────────   ────────────────────────────────
// // # Hello                  <h1>Hello</h1>         (big heading)
// // **bold text**            <strong>bold text</strong>
// // - item one               <li>item one</li>       (bullet list)
// // - item two               <li>item two</li>
// // [click me](url)          <a href="url">click me</a>