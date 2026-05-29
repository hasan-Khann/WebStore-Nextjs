import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import cloudinary from "../lib/cloudinary.js";
import { sql } from "../lib/sql.js";

dotenv.config({ path: ".env.local" });

const seedDir = path.join(process.cwd(), "public/assets/products");

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ---------------- 1. MEDIA ----------------
async function seedMedia() {
  console.log("🖼️ Seeding Media...");
  
  if (!fs.existsSync(seedDir)) {
    console.warn(`⚠️ Seed directory missing at ${seedDir}. Skipping asset processing.`);
    return [];
  }

  const files = fs.readdirSync(seedDir).filter(f =>
    /\.(jpg|jpeg|png|webp)$/i.test(f)
  );

  const mediaRows = [];

  for (const file of files) {
    const public_id = `seed/${file.split(".")[0]}`;
    let res;

    try {
      res = await cloudinary.uploader.upload(
        path.join(seedDir, file),
        { public_id, overwrite: true }
      );
    } catch {
      try {
        res = await cloudinary.api.resource(public_id);
      } catch {
        console.warn(`⚠️ Missing asset reference: ${public_id}`);
        continue;
      }
    }

    const [row] = await sql`
      INSERT INTO media (asset_id, public_id, secure_url, thumbnail_url, format, title)
      VALUES (
        ${res.asset_id},
        ${public_id},
        ${res.secure_url},
        ${res.secure_url.replace("/upload/", "/upload/c_limit,h_60,w_90/")},
        ${res.format},
        ${file}
      )
      ON CONFLICT (public_id)
      DO UPDATE SET updated_at = NOW()
      RETURNING *
    `;

    mediaRows.push(row);
  }

  return mediaRows;
}

// ---------------- 2. CATEGORIES ----------------
async function seedCategories(media) {
  console.log("📂 Seeding Categories...");

  const categories = [
    { name: "Electronics", slug: "electronics", img_id: media[0]?.id || null },
    { name: "Fashion", slug: "fashion", img_id: media[1]?.id || null }
  ];

  const rows = [];

  for (const c of categories) {
    const [row] = await sql`
      INSERT INTO categories (name, slug, img_id)
      VALUES (${c.name}, ${c.slug}, ${c.img_id})
      ON CONFLICT (slug)
      DO UPDATE SET name = EXCLUDED.name
      RETURNING *
    `;
    rows.push(row);
  }

  return rows;
}

// ---------------- 3. PRODUCTS + VARIANTS ----------------
async function seedProductsAndVariants(categories, media) {
  console.log("📦 Seeding Products & Variants...");
  
  if (categories.length === 0) {
    console.warn("⚠️ No categories available to seed products.");
    return [];
  }

  const COLORS = ["Red", "Blue", "Black"];
  const SIZES = ["S", "M", "L"];
  const productsRows = [];

  for (let i = 0; i < 10; i++) {
    const name = faker.commerce.productName();
    const slug = slugify(`${name}-${i}-${Date.now()}`);

    const [product] = await sql`
      INSERT INTO products (name, slug, description, starting_price, category_id)
      VALUES (
        ${name},
        ${slug},
        ${faker.commerce.productDescription()},
        ${faker.number.int({ min: 500, max: 2000 })},
        ${faker.helpers.arrayElement(categories).id}
      )
      RETURNING *
    `;

    productsRows.push(product);

    for (const color of COLORS) {
      for (const size of SIZES) {
        const sku = `SKU-${Date.now()}-${faker.string.alphanumeric(6)}`;

        const [variant] = await sql`
          INSERT INTO product_variants (product_id, color, size, price, sku, stock)
          VALUES (
            ${product.id},
            ${color},
            ${size},
            ${faker.number.int({ min: 500, max: 3000 })},
            ${sku},
            ${faker.number.int({ min: 10, max: 100 })}
          )
          RETURNING *
        `;

        if (media && media.length > 0) {
          const randomMedia = faker.helpers.arrayElements(media, Math.min(media.length, 2));

          for (const m of randomMedia) {
            await sql`
              INSERT INTO variant_images (variant_id, media_id)
              VALUES (${variant.id}, ${m.id})
              ON CONFLICT DO NOTHING
            `;
          }
        }
      }
    }
  }

  return productsRows;
}

// ---------------- 4. USERS ----------------
async function seedUsers() {
  console.log("👤 Seeding Users...");
  const users = [];

  for (let i = 0; i < 5; i++) {
    const email = `${faker.internet.email().toLowerCase()}-${Date.now()}`;

    const [user] = await sql`
      INSERT INTO users (role, username, email, password, is_verified)
      VALUES (
        'user'::user_role,
        ${faker.internet.username()},
        ${email},
        'password123',
        true
      )
      RETURNING *
    `;

    users.push(user);
  }

  return users;
}

// ---------------- 5. REVIEWS ----------------
async function seedReviews(users, products) {
  console.log("⭐ Seeding Reviews...");
  
  if (users.length === 0 || products.length === 0) return;

  for (const p of products.slice(0, 5)) {
    const user = faker.helpers.arrayElement(users);

    await sql`
      INSERT INTO reviews (user_id, product_id, rating, title, comment)
      VALUES (
        ${user.id},
        ${p.id},
        ${faker.number.int({ min: 3, max: 5 })},
        ${faker.lorem.words(3)},
        ${faker.lorem.sentence()}
      )
      ON CONFLICT (user_id, product_id) DO NOTHING
    `;
  }
}

// ---------------- 6. ORDERS ----------------
async function seedOrders(users) {
  console.log("🛒 Seeding Orders...");
  
  if (users.length === 0) return;

  const variants = await sql`
    SELECT pv.*, p.name as product_name
    FROM product_variants pv
    JOIN products p ON pv.product_id = p.id
    LIMIT 5
  `;

  if (variants.length === 0) {
    console.warn("⚠️ No variants found to process orders.");
    return;
  }

  for (let i = 0; i < 5; i++) {
    const user = faker.helpers.arrayElement(users);
    const v = faker.helpers.arrayElement(variants);

    const orderNumber = `ORD-${Date.now()}-${faker.string.alphanumeric(5)}`;

    const address = {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.country()
    };

    const [order] = await sql`
      INSERT INTO orders (
        order_number,
        user_id,
        customer_full_name,
        customer_email,
        customer_phone,
        customer_address,
        subtotal,
        total,
        payment_method,
        payment_status
      )
      VALUES (
        ${orderNumber},
        ${user.id},
        ${faker.person.fullName()},
        ${user.email},
        ${faker.phone.number()},
        ${JSON.stringify(address)},
        ${v.price},
        ${v.price},
        'PayFast'::payment_method_enum,
        'paid'::payment_status_enum
      )
      RETURNING *
    `;

    await sql`
      INSERT INTO order_items (
        order_id,
        variant_id,
        name,
        sku,
        price,
        quantity
      )
      VALUES (
        ${order.id},
        ${v.id},
        ${v.product_name},
        ${v.sku},
        ${v.price},
        1
      )
    `;
  }
}

// ---------------- 7. COUPONS ----------------
async function seedCoupons() {
  console.log("🎟️ Seeding Coupons...");

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  await sql`
    INSERT INTO coupons (code, discount_percentage, min_shopping_amount, expiry)
    VALUES
      ('SAVE10', 10, 500, ${nextYear}),
      ('WELCOME20', 20, 1000, ${nextYear})
    ON CONFLICT (code) DO NOTHING
  `;
}

// ---------------- 8. OTP ----------------
async function seedOtp() {
  console.log("🔢 Seeding OTP...");

  await sql`
    INSERT INTO otps (email, otp, expires_at)
    VALUES (
      'test@example.com',
      '1234',
      NOW() + INTERVAL '10 minutes'
    )
    ON CONFLICT (email)
    DO UPDATE SET
      otp = EXCLUDED.otp,
      expires_at = EXCLUDED.expires_at
  `;
}

// ---------------- RUNNER ----------------
(async () => {
  try {
    console.log("🚀 SQL Seed Starting...");

    await sql`BEGIN`;

    const media = await seedMedia();
    const categories = await seedCategories(media);
    const products = await seedProductsAndVariants(categories, media);
    const users = await seedUsers();

    await seedReviews(users, products);
    await seedOrders(users);

    await seedCoupons();
    await sql`COMMIT`;

    console.log("🌱 SEED COMPLETE (SQL ONLY)");
    process.exit(0);
  } catch (err) {
    await sql`ROLLBACK`;
    console.error("❌ SEED FAILED:", err);
    process.exit(1);
  }
})();