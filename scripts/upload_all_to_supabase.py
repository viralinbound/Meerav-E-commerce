"""
MEERAV NAMKEENS - AUTOMATIC SUPABASE CLOUD UPLOADER
Uploads all 75 product photos, videos, and brand assets to Supabase Storage Bucket: meerav-media
"""

import os
import urllib.request
import urllib.error
import ssl
import json
import time

SUPABASE_URL = "https://rudiggwblncwkjmqqemd.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_-ksMHdEpOjDa5Z9hDdodNg__yz6HisF"
BUCKET = "meerav-media"

BASE_DIR = r"C:\Users\admin\Desktop\viral in bond\LEARNING\mira_gemini"
STORAGE_ROOT = os.path.join(BASE_DIR, "supabase", "storage", "meerav-media")

def get_mime_type(filename):
    ext = os.path.splitext(filename)[1].lower()
    if ext in ['.jpg', '.jpeg']:
        return 'image/jpeg'
    elif ext == '.png':
        return 'image/png'
    elif ext == '.mp4':
        return 'video/mp4'
    elif ext == '.svg':
        return 'image/svg+xml'
    elif ext == '.json':
        return 'application/json'
    return 'application/octet-stream'

def upload_single_file(local_full_path, relative_storage_path):
    mime_type = get_mime_type(local_full_path)
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{relative_storage_path}"
    
    with open(local_full_path, "rb") as f:
        file_bytes = f.read()

    req = urllib.request.Request(
        url,
        data=file_bytes,
        headers={
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            "Content-Type": mime_type,
            "x-upsert": "true"
        },
        method="POST"
    )

    ctx = ssl.create_default_context()
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=60) as resp:
                if resp.status in [200, 201]:
                    return True, f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{relative_storage_path}"
        except urllib.error.HTTPError as e:
            if attempt == 2:
                print(f"[FAIL] HTTP {e.code} for {relative_storage_path}: {e.read().decode()[:100]}")
                return False, None
        except Exception as e:
            if attempt == 2:
                print(f"[ERROR] {relative_storage_path}: {e}")
                return False, None
        time.sleep(1)

    return False, None

def main():
    print("===================================================================")
    print("STARTING DIRECT SUPABASE CLOUD MEDIA UPLOAD")
    print(f"Target Project: {SUPABASE_URL}")
    print(f"Target Bucket: {BUCKET}")
    print("===================================================================")

    if not os.path.exists(STORAGE_ROOT):
        print(f"Storage root not found: {STORAGE_ROOT}")
        return

    all_files = []
    for root, dirs, files in os.walk(STORAGE_ROOT):
        for file in files:
            full_path = os.path.join(root, file)
            # relative path from STORAGE_ROOT
            rel_path = os.path.relpath(full_path, STORAGE_ROOT).replace("\\", "/")
            all_files.append((full_path, rel_path))

    total = len(all_files)
    print(f"Found {total} total assets to upload to Supabase...\n")

    successful = 0
    failed = 0

    for idx, (local_path, rel_path) in enumerate(all_files, 1):
        file_size_kb = os.path.getsize(local_path) / 1024
        print(f"[{idx}/{total}] Uploading ({file_size_kb:.1f} KB): {rel_path} ...", end=" ", flush=True)
        
        ok, cloud_url = upload_single_file(local_path, rel_path)
        if ok:
            print("[SUCCESS]")
            successful += 1
        else:
            print("[FAILED]")
            failed += 1

    print("\n===================================================================")
    print(f"UPLOAD COMPLETE! Successfully uploaded: {successful}/{total} files.")
    if failed > 0:
        print(f"Failed: {failed} files.")
    print(f"All files are now LIVE in Supabase bucket: {BUCKET}")
    print("===================================================================")

if __name__ == "__main__":
    main()
