import re
import json

with open(r"C:\Users\admin\Desktop\viral in bond\LEARNING\mira_gemini\js\data.js", "r", encoding="utf-8") as f:
    js_text = f.read()

# Parse products from data.js
# Extract product blocks using regex
prod_matches = re.findall(r'\{\s*id:\s*"(p\d+)",.*?variants:\s*(\[.*?\])\s*\}', js_text, re.DOTALL)
print(f"Found {len(prod_matches)} products")

# Let's parse all products properly using JavaScript/Node execution
import subprocess

node_script = """
const fs = require('fs');
const dataFile = fs.readFileSync('js/data.js', 'utf8');
eval(dataFile);

let sql = `\\n-- SEED ALL 75 PRODUCTS DATA\\nINSERT INTO public.products (id, name, category, tag, rating, reviews_count, spice_level, dietary, image, video, sample_image, description, ingredients, nutrition, variants, in_stock) VALUES\\n`;

const values = MIRA_DATA.products.map(p => {
    const esc = (str) => (str ? str.replace(/'/g, "''") : '');
    const dietaryJson = JSON.stringify(p.dietary || []);
    const nutritionJson = JSON.stringify(p.nutrition || {});
    const variantsJson = JSON.stringify(p.variants || []);
    
    return `('${p.id}', '${esc(p.name)}', '${p.category}', '${esc(p.tag)}', ${p.rating}, ${p.reviewsCount}, '${esc(p.spiceLevel)}', '${dietaryJson.replace(/'/g, "''")}'::jsonb, '${esc(p.image)}', ${p.video ? `'${esc(p.video)}'` : 'NULL'}, ${p.sampleImage ? `'${esc(p.sampleImage)}'` : 'NULL'}, '${esc(p.description)}', '${esc(p.ingredients)}', '${nutritionJson.replace(/'/g, "''")}'::jsonb, '${variantsJson.replace(/'/g, "''")}'::jsonb, true)`;
});

sql += values.join(',\\n') + `\\nON CONFLICT (id) DO UPDATE SET\\n    name = EXCLUDED.name,\\n    category = EXCLUDED.category,\\n    tag = EXCLUDED.tag,\\n    rating = EXCLUDED.rating,\\n    reviews_count = EXCLUDED.reviews_count,\\n    spice_level = EXCLUDED.spice_level,\\n    dietary = EXCLUDED.dietary,\\n    image = EXCLUDED.image,\\n    video = EXCLUDED.video,\\n    sample_image = EXCLUDED.sample_image,\\n    description = EXCLUDED.description,\\n    ingredients = EXCLUDED.ingredients,\\n    nutrition = EXCLUDED.nutrition,\\n    variants = EXCLUDED.variants,\\n    in_stock = EXCLUDED.in_stock;\\n`;

fs.appendFileSync('supabase/schema.sql', sql);
console.log('Appended all products to supabase/schema.sql successfully!');
"""

with open(r"C:\Users\admin\Desktop\viral in bond\LEARNING\mira_gemini\scripts\append_seed.js", "w", encoding="utf-8") as f:
    f.write(node_script)
