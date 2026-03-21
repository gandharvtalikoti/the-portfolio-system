"use client";

/**
 * FileUploader.tsx — Drag and drop file upload component.
 *
 * Props:
 *   projectId      → which project these files belong to
 *   existingFiles  → files already uploaded (shown in grid)
 *   thumbnailUrl   → current thumbnail URL (to highlight it)
 *   onUploadDone   → called after each successful upload
 *   onDeleteDone   → called after a file is deleted
 *   onThumbnailSet → called after thumbnail is changed
 */

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  uploadFile,
  deleteMediaFile,
  setThumbnail,
  type MediaFile,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Upload,
  X,
  Star,
  Loader2,
  FileVideo,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface FileUploaderProps {
  projectId: string;
  existingFiles: MediaFile[];
  thumbnailUrl: string | null;
  onUploadDone: (file: MediaFile) => void;
  onDeleteDone: (fileId: string) => void;
  onThumbnailSet: (url: string) => void;
}

// tracks the upload state of each file being uploaded
interface UploadingFile {
  id: string;           // temporary local id
  name: string;
  progress: number;     // 0-100
  status: "uploading" | "done" | "error";
  error?: string;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  /**
   * Convert bytes to human readable size.
   * 2048000 → "2.0 MB"
   * 512000  → "500.0 KB"
   */
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file: MediaFile): boolean {
  return file.file_type === "image";
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export function FileUploader({
  projectId,
  existingFiles,
  thumbnailUrl,
  onUploadDone,
  onDeleteDone,
  onThumbnailSet,
}: FileUploaderProps) {

  // files currently being uploaded (showing progress)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  // drag over state — true when user drags a file over the drop zone
  const [isDragOver, setIsDragOver] = useState(false);

  // track which file is being deleted
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [settingThumbId, setSettingThumbId] = useState<string | null>(null);

  // hidden file input ref — we trigger it programmatically
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Upload handler ──
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      // create a temporary id for tracking this upload
      const tempId = `temp-${Date.now()}-${Math.random()}`;

      // add to uploading list immediately (shows progress bar)
      setUploadingFiles((prev) => [
        ...prev,
        { id: tempId, name: file.name, progress: 0, status: "uploading" },
      ]);

      try {
        // upload the file — updates progress bar as it uploads
        const result = await uploadFile(
          file,
          projectId,
          (percent) => {
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === tempId ? { ...f, progress: percent } : f
              )
            );
          }
        );

        // mark as done briefly then remove from uploading list
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === tempId ? { ...f, progress: 100, status: "done" } : f
          )
        );

        // tell parent component about the new file
        onUploadDone(result);

        // remove from uploading list after 1.5 seconds
        // (gives user time to see the green checkmark)
        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((f) => f.id !== tempId));
        }, 1500);

      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.detail || "Upload failed";

        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === tempId
              ? { ...f, status: "error", error: errorMsg }
              : f
          )
        );
      }
    }
  }, [projectId, onUploadDone]);

  // ── Drag and drop handlers ──
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // preventDefault() is required — without it, drop event won't fire
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // e.dataTransfer.files contains the dropped files
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  // ── Click to browse ──
  const handleClick = () => {
    fileInputRef.current?.click();
    // .? is optional chaining — only calls click() if ref exists
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // reset input so same file can be selected again
    e.target.value = "";
  };

  // ── Delete handler ──
  const handleDelete = async (file: MediaFile) => {
    setDeletingId(file.id);
    try {
      await deleteMediaFile(file.id);
      onDeleteDone(file.id);
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Set thumbnail handler ──
  const handleSetThumbnail = async (file: MediaFile) => {
    setSettingThumbId(file.id);
    try {
      await setThumbnail(file.id);
      onThumbnailSet(file.public_url);
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to set thumbnail");
    } finally {
      setSettingThumbId(null);
    }
  };

  return (
    <div className="space-y-4">

      {/* ── Drop Zone ── */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          // base styles
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          // normal state
          "border-slate-200 hover:border-slate-400 hover:bg-slate-50",
          // drag over state
          isDragOver && "border-slate-900 bg-slate-50 scale-[1.01]"
        )}
      >
        {/* hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          // multiple → allow picking several files at once
          // accept  → filters what the file picker shows
        />

        <Upload className={cn(
          "h-8 w-8 mx-auto mb-3 transition-colors",
          isDragOver ? "text-slate-900" : "text-slate-400"
        )} />

        <p className="text-sm font-medium text-slate-700">
          {isDragOver
            ? "Drop files here"
            : "Drag & drop files here"
          }
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          JPG, PNG, WebP, GIF, MP4, MOV, PDF · Max 50MB per file
        </p>
      </div>

      {/* ── Currently Uploading Files ── */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50"
            >
              {/* status icon */}
              {f.status === "uploading" && (
                <Loader2 className="h-4 w-4 animate-spin text-slate-500 flex-shrink-0" />
              )}
              {f.status === "done" && (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              )}
              {f.status === "error" && (
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                {/* filename */}
                <p className="text-xs font-medium truncate">{f.name}</p>

                {/* progress bar */}
                {f.status === "uploading" && (
                  <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full transition-all duration-300"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}

                {/* error message */}
                {f.status === "error" && (
                  <p className="text-xs text-destructive mt-0.5">{f.error}</p>
                )}

                {/* done message */}
                {f.status === "done" && (
                  <p className="text-xs text-green-600 mt-0.5">Upload complete</p>
                )}
              </div>

              {/* percentage */}
              {f.status === "uploading" && (
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {f.progress}%
                </span>
              )}

              {/* dismiss error */}
              {f.status === "error" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadingFiles((prev) =>
                      prev.filter((u) => u.id !== f.id)
                    );
                  }}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Uploaded Files Grid ── */}
      {existingFiles.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {existingFiles.length} file{existingFiles.length !== 1 ? "s" : ""} uploaded
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {existingFiles.map((file) => {
              const isThumb = file.public_url === thumbnailUrl;

              return (
                <div
                  key={file.id}
                  className={cn(
                    "relative group rounded-lg overflow-hidden border-2 transition-all",
                    isThumb
                      ? "border-slate-900"    // highlighted border for thumbnail
                      : "border-transparent hover:border-slate-200"
                  )}
                >
                  {/* ── File Preview ── */}
                  <div className="aspect-square bg-slate-100 relative">

                    {isImageFile(file) ? (
                      /* Image preview */
                      <Image
                        src={file.public_url}
                        alt={file.file_name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    ) : file.file_type === "video" ? (
                      /* Video placeholder */
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <FileVideo className="h-8 w-8 text-slate-400" />
                        <span className="text-xs text-slate-500">Video</span>
                      </div>
                    ) : (
                      /* PDF placeholder */
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <FileText className="h-8 w-8 text-slate-400" />
                        <span className="text-xs text-slate-500">PDF</span>
                      </div>
                    )}

                    {/* Thumbnail badge */}
                    {isThumb && (
                      <div className="absolute top-1.5 left-1.5 bg-slate-900 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 fill-white" />
                        Cover
                      </div>
                    )}

                    {/* ── Hover Actions ── */}
                    {/* only visible on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">

                      {/* Set as thumbnail */}
                      {!isThumb && isImageFile(file) && (
                        <button
                          title="Set as cover image"
                          disabled={settingThumbId === file.id}
                          onClick={() => handleSetThumbnail(file)}
                          className="p-1.5 bg-white rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
                        >
                          {settingThumbId === file.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Star className="h-3.5 w-3.5" />
                          }
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        title="Delete file"
                        disabled={deletingId === file.id}
                        onClick={() => handleDelete(file)}
                        className="p-1.5 bg-white rounded-full hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        {deletingId === file.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <X className="h-3.5 w-3.5" />
                        }
                      </button>

                    </div>
                  </div>

                  {/* ── File Info ── */}
                  <div className="p-1.5 bg-white">
                    <p className="text-xs truncate text-slate-600">
                      {file.file_name}
                    </p>
                    {file.file_size && (
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.file_size)}
                      </p>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
// ```

// ---

// ### Step 3 — Wire FileUploader into ProjectForm

// Now we add the uploader to the project form. But there's one important thing to understand first:
// ```
// Problem:
// FileUploader needs a project_id to upload files.
// But project_id only exists AFTER the project is created.

// So the flow is:
// 1. Fill in title, category etc.
// 2. Click "Create Project" → project saved to DB → get project_id
// 3. THEN show the file uploader with that project_id

// For EDIT mode:
// Project already exists → show uploader immediately