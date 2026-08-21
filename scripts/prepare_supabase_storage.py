"""
MEERAV NAMKEENS - SUPABASE CLOUD STORAGE ORGANIZER & ASSET MIGRATION
Systematically organizes all photos and videos by Category -> Product ID -> Photos / Videos
"""

import os
import shutil
import json

BASE_DIR = r"C:\Users\admin\Desktop\viral in bond\LEARNING\mira_gemini"
STORAGE_ROOT = os.path.join(BASE_DIR, "supabase", "storage", "meerav-media")
ASSETS_DIR = os.path.join(BASE_DIR, "assets")

SUPABASE_PUBLIC_URL_PREFIX = "https://rudiggwblncwkjmqqemd.supabase.co/storage/v1/object/public/meerav-media"

# Define category mapping for all 75 products
CATEGORY_MAP = {
    # 1. Bhujia & Sev (p1 - p15)
    "p1": {"cat": "bhujia-sev", "img": "cinematic_bhujia.jpg", "video": "clip_bhujia.mp4", "sample": "drive_1.jpg"},
    "p2": {"cat": "bhujia-sev", "img": "cinematic_papad.jpg", "video": "clip_papad.mp4", "sample": "drive_2.jpg"},
    "p3": {"cat": "bhujia-sev", "img": "cinematic_bhujia.jpg", "video": None, "sample": "drive_3.jpg"},
    "p4": {"cat": "bhujia-sev", "img": "cinematic_mixture.jpg", "video": "clip_mixture.mp4", "sample": "drive_4.jpg"},
    "p5": {"cat": "bhujia-sev", "img": "cinematic_namkeen.jpg", "video": "clip_namkeen.mp4", "sample": "drive_5.jpg"},
    "p6": {"cat": "bhujia-sev", "img": "cinematic_bhujia.jpg", "video": None, "sample": "drive_6.jpg"},
    "p7": {"cat": "bhujia-sev", "img": "cinematic_bhujia.jpg", "video": None, "sample": "drive_7.jpg"},
    "p8": {"cat": "bhujia-sev", "img": "cinematic_bhujia.jpg", "video": None, "sample": "drive_8.jpg"},
    
    # 2. Mixture & Farsan (p16 - p30)
    "p16": {"cat": "mixture-farsan", "img": "cinematic_mixture.jpg", "video": "clip_mixture.mp4", "sample": "drive_1.jpg"},
    "p17": {"cat": "mixture-farsan", "img": "cinematic_namkeen.jpg", "video": "clip_namkeen.mp4", "sample": "drive_2.jpg"},
    "p18": {"cat": "mixture-farsan", "img": "cinematic_raita_boondi.jpg", "video": "clip_raita_boondi.mp4", "sample": "drive_3.jpg"},
    "p19": {"cat": "mixture-farsan", "img": "cinematic_chips.jpg", "video": "clip_chips.mp4", "sample": "drive_4.jpg"},
    "p20": {"cat": "mixture-farsan", "img": "cinematic_mixture.jpg", "video": None, "sample": "drive_5.jpg"},
    "p21": {"cat": "mixture-farsan", "img": "cinematic_mixture.jpg", "video": None, "sample": "drive_6.jpg"},
    "p22": {"cat": "mixture-farsan", "img": "cinematic_namkeen.jpg", "video": "clip_namkeen.mp4", "sample": "drive_7.jpg"},
    "p23": {"cat": "mixture-farsan", "img": "cinematic_mixture.jpg", "video": None, "sample": "drive_8.jpg"},
    "p24": {"cat": "mixture-farsan", "img": "cinematic_raita_boondi.jpg", "video": "clip_raita_boondi.mp4", "sample": "drive_1.jpg"},

    # 3. Papad & Mathri (p31 - p45)
    "p31": {"cat": "mathri", "img": "cinematic_papad.jpg", "video": "clip_papad.mp4", "sample": "drive_2.jpg"},
    "p32": {"cat": "mathri", "img": "cinematic_papad.jpg", "video": None, "sample": "drive_3.jpg"},
    "p33": {"cat": "mathri", "img": "cinematic_papad.jpg", "video": None, "sample": "drive_4.jpg"},
    "p34": {"cat": "mathri", "img": "cinematic_papad.jpg", "video": None, "sample": "drive_5.jpg"},

    # 4. Roasted Diet Snacks (p46 - p60)
    "p46": {"cat": "roasted-diet", "img": "cinematic_moong_dal.jpg", "video": "clip_moong_dal.mp4", "sample": "drive_6.jpg"},
    "p47": {"cat": "roasted-diet", "img": "cinematic_moong_dal.jpg", "video": None, "sample": "drive_7.jpg"},
    "p48": {"cat": "roasted-diet", "img": "cinematic_moong_dal.jpg", "video": None, "sample": "drive_8.jpg"},
    "p56": {"cat": "roasted-diet", "img": "cinematic_masala_peanuts.jpg", "video": "clip_masala_peanuts.mp4", "sample": "drive_1.jpg"},

    # 5. Sweets & Hampers (p61 - p75)
    "p61": {"cat": "sweets-combos", "img": "cinematic_chips.jpg", "video": "clip_chips.mp4", "sample": "drive_2.jpg"},
    "p62": {"cat": "sweets-combos", "img": "cinematic_chips.jpg", "video": None, "sample": "drive_3.jpg"},
    "p63": {"cat": "sweets-combos", "img": "cinematic_chips.jpg", "video": None, "sample": "drive_4.jpg"},
}

def build_storage_hierarchy():
    print(f"Creating systematic Supabase Cloud storage structure in {STORAGE_ROOT}...")
    
    # 1. Brand assets
    brand_logo_dir = os.path.join(STORAGE_ROOT, "brand", "logo")
    brand_video_dir = os.path.join(STORAGE_ROOT, "brand", "videos")
    os.makedirs(brand_logo_dir, exist_ok=True)
    os.makedirs(brand_video_dir, exist_ok=True)

    src_logo = os.path.join(ASSETS_DIR, "images", "meerav_logo.png")
    if os.path.exists(src_logo):
        shutil.copy(src_logo, os.path.join(brand_logo_dir, "meerav_logo.png"))

    src_brand_video = os.path.join(ASSETS_DIR, "videos", "meerav_brand_film.mp4")
    if os.path.exists(src_brand_video):
        shutil.copy(src_brand_video, os.path.join(brand_video_dir, "meerav_brand_film.mp4"))

    # 2. Categories & Products
    manifest = []
    
    for pid in range(1, 76):
        prod_id = f"p{pid}"
        
        # Determine category
        if pid <= 15:
            cat_id = "bhujia-sev"
            default_img = "cinematic_bhujia.jpg"
            default_vid = "clip_bhujia.mp4" if pid in [1, 2, 4] else None
        elif pid <= 30:
            cat_id = "mixture-farsan"
            default_img = "cinematic_mixture.jpg"
            default_vid = "clip_mixture.mp4" if pid in [16, 17, 19, 22, 24] else None
        elif pid <= 45:
            cat_id = "mathri"
            default_img = "cinematic_papad.jpg"
            default_vid = "clip_papad.mp4" if pid in [31, 32] else None
        elif pid <= 60:
            cat_id = "roasted-diet"
            default_img = "cinematic_moong_dal.jpg"
            default_vid = "clip_moong_dal.mp4" if pid in [46, 56] else None
        else:
            cat_id = "sweets-combos"
            default_img = "cinematic_chips.jpg"
            default_vid = "clip_chips.mp4" if pid in [61] else None

        # Check override
        info = CATEGORY_MAP.get(prod_id, {
            "cat": cat_id,
            "img": default_img,
            "video": default_vid,
            "sample": f"drive_{((pid - 1) % 8) + 1}.jpg"
        })

        # Create target directories: categories/{category_id}/products/{product_id}/photos & videos
        prod_photo_dir = os.path.join(STORAGE_ROOT, "categories", info["cat"], "products", prod_id, "photos")
        prod_video_dir = os.path.join(STORAGE_ROOT, "categories", info["cat"], "products", prod_id, "videos")
        os.makedirs(prod_photo_dir, exist_ok=True)
        os.makedirs(prod_video_dir, exist_ok=True)

        # Copy pack image
        img_src = os.path.join(ASSETS_DIR, "images", info["img"])
        img_dest_name = f"{prod_id}_{info['img']}"
        if os.path.exists(img_src):
            shutil.copy(img_src, os.path.join(prod_photo_dir, img_dest_name))

        # Copy sample image
        sample_src = os.path.join(ASSETS_DIR, "images", info["sample"])
        sample_dest_name = f"{prod_id}_sample_{info['sample']}"
        if os.path.exists(sample_src):
            shutil.copy(sample_src, os.path.join(prod_photo_dir, sample_dest_name))

        # Copy video if exists
        cloud_video_url = None
        if info["video"]:
            vid_src = os.path.join(ASSETS_DIR, "videos", info["video"])
            vid_dest_name = f"{prod_id}_{info['video']}"
            if os.path.exists(vid_src):
                shutil.copy(vid_src, os.path.join(prod_video_dir, vid_dest_name))
                cloud_video_url = f"{SUPABASE_PUBLIC_URL_PREFIX}/categories/{info['cat']}/products/{prod_id}/videos/{vid_dest_name}"

        cloud_img_url = f"{SUPABASE_PUBLIC_URL_PREFIX}/categories/{info['cat']}/products/{prod_id}/photos/{img_dest_name}"
        cloud_sample_url = f"{SUPABASE_PUBLIC_URL_PREFIX}/categories/{info['cat']}/products/{prod_id}/photos/{sample_dest_name}"

        manifest.append({
            "productId": prod_id,
            "category": info["cat"],
            "cloudImageUrl": cloud_img_url,
            "cloudVideoUrl": cloud_video_url,
            "cloudSampleImageUrl": cloud_sample_url
        })

    # Save Cloud Storage Manifest
    manifest_path = os.path.join(STORAGE_ROOT, "cloud_storage_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"[OK] Created systematic media hierarchy for all 75 products in: {STORAGE_ROOT}")
    print(f"[OK] Generated cloud storage manifest: {manifest_path}")

if __name__ == "__main__":
    build_storage_hierarchy()
