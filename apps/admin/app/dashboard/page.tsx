"use client";


import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/hooks/useProjects";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  FileText,
  Eye,
  EyeOff,
  Plus,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useBlog } from "@/hooks/useBlog";

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, isLoading: projectsLoading } = useProjects();
const { posts, isLoading: postsLoading }       = useBlog();
const isLoading = projectsLoading || postsLoading;

  const published = projects.filter((p) => p.is_published);
  const drafts    = projects.filter((p) => !p.is_published);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {user?.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">


        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                {isLoading
                  ? <div className="h-8 w-12 bg-slate-100 animate-pulse rounded mt-1" />
                  : <p className="text-3xl font-bold mt-1">{projects.length}</p>
                }
              </div>
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                {isLoading
                  ? <div className="h-8 w-12 bg-slate-100 animate-pulse rounded mt-1" />
                  : <p className="text-3xl font-bold mt-1 text-green-600">{published.length}</p>
                }
              </div>
              <Eye className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                {isLoading
                  ? <div className="h-8 w-12 bg-slate-100 animate-pulse rounded mt-1" />
                  : <p className="text-3xl font-bold mt-1 text-slate-400">{drafts.length}</p>
                }
              </div>
              <EyeOff className="h-5 w-5 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
  <CardContent className="pt-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Blog Posts</p>
        {isLoading
          ? <div className="h-8 w-12 bg-slate-100 animate-pulse rounded mt-1" />
          : <p className="text-3xl font-bold mt-1">{posts.length}</p>
        }
      </div>
      <FileText className="h-5 w-5 text-muted-foreground" />
    </div>
  </CardContent>
</Card>

      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/blog/new">
            <Plus className="h-4 w-4 mr-2" />
            New Blog Post
          </Link>
        </Button>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Recent Projects</CardTitle>
            <CardDescription>Your latest work</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">View all →</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No projects yet.
              </p>
              <Button variant="link" size="sm" asChild className="mt-1">
                <Link href="/projects/new">Create your first →</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between py-1"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {project.title}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                      {project.category} · {formatDate(project.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant={project.is_published ? "default" : "secondary"}
                    className={project.is_published
                      ? "bg-green-100 text-green-800 hover:bg-green-100 ml-3 flex-shrink-0"
                      : "ml-3 flex-shrink-0"
                    }
                  >
                    {project.is_published ? "Live" : "Draft"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
// ```

// ---

// ### Step 12g — Test everything

// Make sure both servers are running, then:

// **Test 1 — Create a project:**
// Go to http://localhost:3001/projects/new

// Fill in:

// Title:       My First Project
// Category:    Photography
// Description: Testing the form
// Tags:        test, photography
// Published:   toggle ON

// Click Create Project. You should land back on `/projects` and see it in the table.

// **Test 2 — Check the API:**
// Open http://localhost:8000/docs → GET /api/projects → Execute

// You should see your project in the response.

// **Test 3 — Toggle publish:**
// Click the eye icon on your project row.
// Badge should switch between Live and Draft.

// **Test 4 — Edit a project:**
// Click the pencil icon.
// Change the title.
// Click Save Changes.
// Table should show the new title.

// **Test 5 — Delete a project:**
// Click the trash icon → confirm buttons appear.
// Click Delete → project disappears from list.

// **Test 6 — Dashboard stats:**
// Go to /dashboard — you should see real numbers now.

// ---

// ### Current state

// ✅ useProjects hook    — fetch, create, update, delete, toggle
// ✅ ProjectForm         — shared create/edit form with slug auto-gen
// ✅ /projects           — table with actions
// ✅ /projects/new       — create form
// ✅ /projects/[id]      — edit form
// ✅ /dashboard          — real stats from API
// ```