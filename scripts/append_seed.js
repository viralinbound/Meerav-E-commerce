const fs = require('fs');

let code = fs.readFileSync('js/data.js', 'utf8');
code = code.replace(/const MIRA_DATA\s*=/, 'global.MIRA_DATA =');
eval(code);

const MIRA_DATA = global.MIRA_DATA;
console.log(`Loaded ${MIRA_DATA.products.length} products`);

let sql = `\n-- SEED ALL 75 PRODUCTS DATA\nINSERT INTO public.products (id, name, category, tag, rating, reviews_count, spice_level, dietary, image, video, sample_image, description, ingredients, nutrition, variants, in_stock) VALUES\n`;

const values = MIRA_DATA.products.map(p => {
    const esc = (str) => (str ? String(str).replace(/'/g, "''") : '');
    const dietaryJson = JSON.stringify(p.dietary || []);
    const nutritionJson = JSON.stringify(p.nutrition || {});
    const variantsJson = JSON.stringify(p.variants || []);
    
    return `('${p.id}', '${esc(p.name)}', '${p.category}', '${esc(p.tag)}', ${p.rating}, ${p.reviewsCount}, '${esc(p.spiceLevel)}', '${dietaryJson.replace(/'/g, "''")}'::jsonb, '${esc(p.image)}', ${p.video ? `'${esc(p.video)}'` : 'NULL'}, ${p.sampleImage ? `'${esc(p.sampleImage)}'` : 'NULL'}, '${esc(p.description)}', '${esc(p.ingredients)}', '${nutritionJson.replace(/'/g, "''")}'::jsonb, '${variantsJson.replace(/'/g, "''")}'::jsonb, true)`;
});

sql += values.join(',\n') + `\nON CONFLICT (id) DO UPDATE SET\n    name = EXCLUDED.name,\n    category = EXCLUDED.category,\n    tag = EXCLUDED.tag,\n    rating = EXCLUDED.rating,\n    reviews_count = EXCLUDED.reviews_count,\n    spice_level = EXCLUDED.spice_level,\n    dietary = EXCLUDED.dietary,\n    image = EXCLUDED.image,\n    video = EXCLUDED.video,\n    sample_image = EXCLUDED.sample_image,\n    description = EXCLUDED.description,\n    ingredients = EXCLUDED.ingredients,\n    nutrition = EXCLUDED.nutrition,\n    variants = EXCLUDED.variants,\n    in_stock = EXCLUDED.in_stock;\n`;

fs.appendFileSync('supabase/schema.sql', sql);
console.log('Appended all 75 products to supabase/schema.sql successfully!');
