import { sql } from "@/lib/sql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    /* =========================================================
       EXTENSIONS
    ========================================================= */

    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`CREATE EXTENSION IF NOT EXISTS citext`;
    await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;

    /* =========================================================
       ENUMS
    ========================================================= */

    await sql`
      DO $$
      BEGIN
        CREATE TYPE user_role AS ENUM ('user','admin','employee');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$
      BEGIN
        CREATE TYPE payment_method_enum AS ENUM ('COD','PayFast');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$
      BEGIN
        CREATE TYPE payment_status_enum AS ENUM ('pending','paid','failed','refunded');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$
      BEGIN
        CREATE TYPE order_status_enum AS ENUM ('processing','delivered','cancelled','returned');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    /* =========================================================
       USERS
    ========================================================= */

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        role user_role NOT NULL DEFAULT 'user',
        username CITEXT NOT NULL,
        email CITEXT UNIQUE,
        password VARCHAR(255),
        refresh_token TEXT,
        login_method VARCHAR(50) DEFAULT 'local',
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    /* =========================================================
       OTPS
    ========================================================= */

    await sql`
      CREATE TABLE IF NOT EXISTS otps (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email CITEXT NOT NULL UNIQUE,
        otp VARCHAR(4) NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    /* =========================================================
       MEDIA
    ========================================================= */

    await sql`
      CREATE TABLE IF NOT EXISTS media (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        asset_id VARCHAR(255) NOT NULL,
        public_id VARCHAR(255) UNIQUE NOT NULL,
        secure_url TEXT NOT NULL,
        thumbnail_url TEXT NOT NULL,
        format VARCHAR(50),
        alt VARCHAR(255) DEFAULT '',
        title VARCHAR(255) DEFAULT 'Untitled',
        deleted_at TIMESTAMPTZ DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_media_active
      ON media(created_at DESC)
      WHERE deleted_at IS NULL
    `;

    /* =========================================================
       CATEGORIES
    ========================================================= */

    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        img_id UUID REFERENCES media(id) ON DELETE SET NULL,
        deleted_at TIMESTAMPTZ DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    /* =========================================================
       PRODUCTS
    ========================================================= */

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        category_id UUID NOT NULL
        REFERENCES categories(id) ON DELETE RESTRICT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        starting_price DECIMAL(10,2) DEFAULT 0.00,
        deleted_at TIMESTAMPTZ DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    /* -------------------------
       LISTING / SEARCH INDEXES
    --------------------------*/
    await sql`
      CREATE INDEX IF NOT EXISTS idx_products_search_trgm 
      ON products USING GIN ((name || ' ' || slug) gin_trgm_ops) 
      WHERE deleted_at IS NULL;
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_products_category_active
      ON products (category_id)
      WHERE deleted_at IS NULL;
    `;

    /* =========================================================
       PRODUCT VARIANTS
    ========================================================= */

    await sql`
      CREATE TABLE IF NOT EXISTS product_variants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL
        REFERENCES products(id) ON DELETE CASCADE,
        color VARCHAR(100),
        size VARCHAR(50) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) DEFAULT 0.00,
        sku VARCHAR(100) UNIQUE NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        deleted_at TIMESTAMPTZ DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    /* -------------------------
       VARIANT INDEXES
    --------------------------*/

    await sql`
      CREATE INDEX IF NOT EXISTS idx_variants_stock_size
      ON product_variants(product_id, stock, size)
      WHERE deleted_at IS NULL
      AND stock > 0
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_variants_price_asc 
      ON product_variants ((price - discount) ASC, id ASC) 
      WHERE deleted_at IS NULL AND stock > 0
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_variants_effective_price_desc 
      ON product_variants ((price - discount) DESC, id DESC) 
      WHERE deleted_at IS NULL AND stock > 0;
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_variants_newest_cursor 
      ON product_variants (created_at DESC, id DESC) 
      WHERE deleted_at IS NULL AND stock > 0;
    `;

    /* =========================================================
       VARIANT IMAGES
    ========================================================= */

    await sql`
      CREATE TABLE IF NOT EXISTS variant_images (
        variant_id UUID NOT NULL
        REFERENCES product_variants(id) ON DELETE CASCADE,
        media_id UUID NOT NULL
        REFERENCES media(id) ON DELETE CASCADE,
        PRIMARY KEY (variant_id, media_id)
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_variant_images_media_id
      ON variant_images(media_id)
    `;

    /* =========================================================
       CARTS
    ========================================================= */

    await sql`
      CREATE TABLE IF NOT EXISTS carts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    /* =========================================================
       CART ITEMS
    ========================================================= */

    await sql`
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        cart_id UUID NOT NULL
        REFERENCES carts(id) ON DELETE CASCADE,
        variant_id UUID NOT NULL
        REFERENCES product_variants(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1
        CHECK(quantity > 0),
        -- snapshots
        name VARCHAR(255),
        sku VARCHAR(100),
        media TEXT,
        price DECIMAL(10,2),
        color VARCHAR(100),
        size VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_cart_variant
        UNIQUE(cart_id, variant_id)
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id
      ON cart_items(variant_id)
    `;

    /* =========================================================
       COUPONS
    ========================================================= */

    await sql`
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code CITEXT UNIQUE NOT NULL,
        discount_percentage DECIMAL(5,2) NOT NULL
        CHECK (
          discount_percentage >= 0
          AND discount_percentage <= 100
        ),
        min_shopping_amount DECIMAL(10,2) DEFAULT 0.00,
        expiry TIMESTAMPTZ NOT NULL,
        max_redemptions INTEGER DEFAULT 1000,
        redeemed_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    /* =========================================================
       ORDERS
    ========================================================= */

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        user_id UUID
        REFERENCES users(id) ON DELETE SET NULL,
        customer_full_name VARCHAR(255) NOT NULL,
        customer_email CITEXT NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        customer_address JSONB NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        delivery_cost DECIMAL(10,2) DEFAULT 0.00,
        discount DECIMAL(10,2) DEFAULT 0.00,
        total DECIMAL(10,2) NOT NULL,
        payment_method payment_method_enum NOT NULL,
        payment_status payment_status_enum DEFAULT 'pending',
        order_status order_status_enum DEFAULT 'processing',
        tracking_number VARCHAR(100),
        delivered_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;

    /* -------------------------
       ORDER INDEXES
    --------------------------*/

    await sql`
      CREATE INDEX IF NOT EXISTS idx_orders_user
      ON orders(user_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_orders_email
      ON orders(customer_email)
    `;

    /* =========================================================
       ORDER ITEMS
    ========================================================= */

    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID NOT NULL
        REFERENCES orders(id) ON DELETE CASCADE,
        variant_id UUID
        REFERENCES product_variants(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100),
        media TEXT,
        price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL
        CHECK(quantity > 0)
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id
      ON order_items(order_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_order_items_variant_id
      ON order_items(variant_id)
    `;

    /* =========================================================
       REVIEWS
    ========================================================= */

    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID NOT NULL
        REFERENCES products(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL
        CHECK(rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        comment TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT unique_user_product_review
        UNIQUE(user_id, product_id)
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_reviews_product_created
      ON reviews(product_id, created_at DESC)
    `;

    console.log("schema ready ✅");

    return NextResponse.json({
      success: true,
      message: "Optimized schema created successfully",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}