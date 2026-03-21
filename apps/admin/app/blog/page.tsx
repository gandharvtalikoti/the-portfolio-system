"use client";

import { useState } from "react";
import Link from "next/link";
import { useBlog } from "@/hooks/useBlog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/lib/api";

export default function BlogPage() {
  const { posts, isLoading, error, deletePost } = useBlog();

  const [deletingId, setDeletingId]       = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deletePost(id);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground mt-1">
            {isLoading
              ? "Loading..."
              : `${posts.length} post${posts.length !== 1 ? "s" : ""} total`
            }
          </p>
        </div>
        <Button asChild>
          <Link href="/blog/new">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty */}
          {!isLoading && posts.length === 0 && (
            <div className="text-center py-16 space-y-3">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
              <div>
                <p className="font-medium">No posts yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Write your first blog post
                </p>
              </div>
              <Button asChild size="sm">
                <Link href="/blog/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Write a Post
                </Link>
              </Button>
            </div>
          )}

          {/* Posts table */}
          {!isLoading && posts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Title
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                      Created
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {posts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-slate-50 transition-colors"
                    >

                      {/* Title + excerpt */}
                      <td className="px-4 py-3">
                        <p className="font-medium">{post.title}</p>
                        {post.excerpt && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {post.excerpt}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          /blog/{post.slug}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {formatDate(post.created_at)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge
                          variant={post.is_published ? "default" : "secondary"}
                          className={post.is_published
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : ""
                          }
                        >
                          {post.is_published ? "Live" : "Draft"}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">

                          {confirmDeleteId === post.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deletingId === post.id}
                                onClick={() => handleDelete(post.id)}
                              >
                                {deletingId === post.id
                                  ? <Loader2 className="h-3 w-3 animate-spin" />
                                  : "Delete"
                                }
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              {/* Edit */}
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Edit"
                                asChild
                              >
                                <Link href={`/blog/${post.id}`}>
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>

                              {/* Delete */}
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Delete"
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setConfirmDeleteId(post.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </CardContent>
      </Card>

    </div>
  );
}