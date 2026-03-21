"""
s3_service.py — All S3 operations in one place.

Responsibilities:
1. upload_file()   → upload a file to S3, return key + url
2. delete_file()   → delete a file from S3 by key
3. get_public_url() → build the public URL for a given key

Why wrap boto3 in a service?
- Routes stay clean (no boto3 code scattered everywhere)
- Easy to swap S3 for something else later
- Easy to test (mock this service in tests)
- All S3 error handling in one place
"""

import boto3
import uuid
import os
from botocore.exceptions import ClientError, NoCredentialsError
from fastapi import HTTPException, UploadFile
from app.core.config import settings


# ─────────────────────────────────────────────
# ALLOWED FILE TYPES
# Only accept these — reject everything else
# ─────────────────────────────────────────────

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
}

ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/quicktime",   # .mov
    "video/x-msvideo",   # .avi
    "video/webm",
}

ALLOWED_PDF_TYPES = {
    "application/pdf",
}

ALL_ALLOWED_TYPES = (
    ALLOWED_IMAGE_TYPES |
    ALLOWED_VIDEO_TYPES |
    ALLOWED_PDF_TYPES
)
# | operator merges sets together

# Maximum file size: 50MB in bytes
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


# ─────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────

def get_file_type_category(content_type: str) -> str:
    """
    Returns "image", "video", or "pdf" based on content type.

    content_type is what the browser sends to tell us
    what kind of file it is:
    "image/jpeg" → "image"
    "video/mp4"  → "video"
    """
    if content_type in ALLOWED_IMAGE_TYPES:
        return "image"
    elif content_type in ALLOWED_VIDEO_TYPES:
        return "video"
    elif content_type in ALLOWED_PDF_TYPES:
        return "pdf"
    else:
        return "unknown"


def generate_s3_key(project_id: str, filename: str) -> str:
    """
    Generate a unique S3 key for a file.

    Format: projects/{project_id}/{uuid}-{clean_filename}

    Example:
    project_id = "abc-123"
    filename   = "My Beach Photo!.jpg"
    result     = "projects/abc-123/a3f8c2d1-my-beach-photo.jpg"

    Why UUID prefix?
    Without it, uploading two files named "photo.jpg"
    to the same project would overwrite each other.
    UUID guarantees uniqueness.
    """
    # clean the filename:
    # "My Beach Photo!.jpg" → "my-beach-photo.jpg"
    name, ext = os.path.splitext(filename)
    # splitext("photo.jpg") → ("photo", ".jpg")

    clean_name = (
        name
        .lower()
        .strip()
        .replace(" ", "-")
        .replace("_", "-")
    )
    # remove any characters that aren't letters, numbers, or hyphens
    import re
    clean_name = re.sub(r'[^a-z0-9-]', '', clean_name)
    clean_name = clean_name[:50]  # max 50 chars for the name part

    unique_id = str(uuid.uuid4())[:8]  # first 8 chars of uuid is enough

    return f"projects/{project_id}/{unique_id}-{clean_name}{ext}"


def get_public_url(s3_key: str) -> str:
    """
    Build the public URL for an S3 object.

    If CloudFront is configured → use CDN URL (faster)
    If not → use direct S3 URL

    Direct S3 URL format:
    https://{bucket}.s3.{region}.amazonaws.com/{key}

    CloudFront URL format (later):
    https://{cloudfront_domain}/{key}
    """
    if settings.CLOUDFRONT_DOMAIN:
        # CloudFront CDN URL (Phase 7)
        return f"https://{settings.CLOUDFRONT_DOMAIN}/{s3_key}"
    else:
        # Direct S3 URL
        return (
            f"https://{settings.S3_BUCKET_NAME}"
            f".s3.{settings.AWS_REGION}"
            f".amazonaws.com/{s3_key}"
        )


# ─────────────────────────────────────────────
# S3 CLIENT
# Create once, reuse everywhere
# ─────────────────────────────────────────────

def get_s3_client():
    """
    Create and return an S3 client.

    boto3.client() creates a connection to AWS S3
    using your credentials from settings (.env file).

    We call this inside functions (not at module level)
    so it picks up the latest settings every time.
    """
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )


# ─────────────────────────────────────────────
# MAIN SERVICE FUNCTIONS
# ─────────────────────────────────────────────

async def upload_file(
    file: UploadFile,
    project_id: str,
) -> dict:
    """
    Upload a file to S3 and return its metadata.

    Steps:
    1. Validate file type (image/video/pdf only)
    2. Read file content into memory
    3. Validate file size (max 50MB)
    4. Generate unique S3 key
    5. Upload to S3
    6. Return metadata dict

    Returns:
    {
        "s3_key": "projects/abc-123/a3f8-photo.jpg",
        "public_url": "https://bucket.s3.../...",
        "file_name": "photo.jpg",
        "file_type": "image",
        "file_size": 2048000,
        "content_type": "image/jpeg"
    }
    """

    # ── Step 1: Validate file type ──
    content_type = file.content_type or ""

    if content_type not in ALL_ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"File type '{content_type}' is not allowed. "
                f"Allowed types: images (JPG, PNG, WebP, GIF), "
                f"videos (MP4, MOV, AVI), PDFs."
            )
        )

    # ── Step 2: Read file content ──
    # await is needed because reading a file is async
    # (it might take time for large files)
    file_content = await file.read()

    # ── Step 3: Validate file size ──
    file_size = len(file_content)
    if file_size > MAX_FILE_SIZE:
        size_mb = file_size / (1024 * 1024)
        raise HTTPException(
            status_code=400,
            detail=f"File too large: {size_mb:.1f}MB. Maximum allowed: 50MB."
        )

    if file_size == 0:
        raise HTTPException(
            status_code=400,
            detail="File is empty."
        )

    # ── Step 4: Generate unique S3 key ──
    original_filename = file.filename or "upload"
    s3_key = generate_s3_key(project_id, original_filename)

    # ── Step 5: Upload to S3 ──
    try:
        s3_client = get_s3_client()

        # upload_fileobj streams the file to S3
        # we use BytesIO to convert bytes → file-like object
        import io
        s3_client.upload_fileobj(
            io.BytesIO(file_content),  # file data
            settings.S3_BUCKET_NAME,  # which bucket
            s3_key,                   # where inside the bucket
            ExtraArgs={
                "ContentType": content_type,
                # tells S3 what kind of file this is
                # without this, browsers download instead of display
            }
        )

    except NoCredentialsError:
        raise HTTPException(
            status_code=500,
            detail="AWS credentials not configured. Check your .env file."
        )
    except ClientError as e:
        # ClientError covers all AWS API errors
        error_code = e.response["Error"]["Code"]
        raise HTTPException(
            status_code=500,
            detail=f"S3 upload failed: {error_code}"
        )

    # ── Step 6: Return metadata ──
    file_type_category = get_file_type_category(content_type)
    public_url = get_public_url(s3_key)

    return {
        "s3_key": s3_key,
        "public_url": public_url,
        "file_name": original_filename,
        "file_type": file_type_category,
        "file_size": file_size,
        "content_type": content_type,
    }


def delete_file(s3_key: str) -> bool:
    """
    Delete a file from S3 by its key.

    Returns True if deleted, False if it didn't exist.

    Note: S3 delete is idempotent — deleting a
    non-existent key doesn't raise an error.
    We check if it existed first.
    """
    try:
        s3_client = get_s3_client()

        # check if object exists before deleting
        try:
            s3_client.head_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=s3_key
            )
            # head_object just checks metadata — doesn't download the file
        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                # file doesn't exist — nothing to delete
                return False
            raise

        # delete the object
        s3_client.delete_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=s3_key
        )

        return True

    except NoCredentialsError:
        raise HTTPException(
            status_code=500,
            detail="AWS credentials not configured."
        )
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        raise HTTPException(
            status_code=500,
            detail=f"S3 delete failed: {error_code}"
        )