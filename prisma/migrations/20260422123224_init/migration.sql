-- CreateEnum
CREATE TYPE "UgcSource" AS ENUM ('CAMPAIGN', 'HASHTAG', 'MENTION', 'REVIEW_REQUEST', 'MANUAL');

-- CreateEnum
CREATE TYPE "UgcMediaType" AS ENUM ('VIDEO', 'PHOTO', 'CAROUSEL', 'TESTIMONIAL_VIDEO', 'TEXT_REVIEW');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'SENT', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "WidgetLayout" AS ENUM ('GRID', 'MASONRY', 'CAROUSEL', 'SHOP_THE_LOOK');

-- CreateTable
CREATE TABLE "ugc_assets" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "agency_user_id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "creator_user_id" TEXT,
    "source" "UgcSource" NOT NULL,
    "media_type" "UgcMediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "caption" TEXT,
    "author_handle" TEXT,
    "platform" TEXT,
    "original_post_url" TEXT,
    "moderation_status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "moderated_by" TEXT,
    "moderated_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ugc_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_tags" (
    "id" TEXT NOT NULL,
    "ugc_asset_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_url" TEXT,
    "image_url" TEXT,
    "price" DOUBLE PRECISION,
    "pos_x" DOUBLE PRECISION,
    "pos_y" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_requests" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "agency_user_id" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "customer_name" TEXT,
    "order_id" TEXT,
    "product_id" TEXT,
    "product_name" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_reviews" (
    "id" TEXT NOT NULL,
    "review_request_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "media_url" TEXT,
    "media_type" "UgcMediaType",
    "moderation_status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "widgets" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "agency_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "layout" "WidgetLayout" NOT NULL DEFAULT 'GRID',
    "title" TEXT,
    "description" TEXT,
    "auto_filter" JSONB,
    "max_items" INTEGER NOT NULL DEFAULT 12,
    "primary_color" TEXT,
    "show_caption" BOOLEAN NOT NULL DEFAULT true,
    "show_handle" BOOLEAN NOT NULL DEFAULT true,
    "show_buy_button" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "embed_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "widgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "widget_items" (
    "id" TEXT NOT NULL,
    "widget_id" TEXT NOT NULL,
    "ugc_asset_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "widget_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "review_requests_token_key" ON "review_requests"("token");

-- CreateIndex
CREATE UNIQUE INDEX "customer_reviews_review_request_id_key" ON "customer_reviews"("review_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "widgets_slug_key" ON "widgets"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "widgets_embed_key_key" ON "widgets"("embed_key");

-- CreateIndex
CREATE UNIQUE INDEX "widget_items_widget_id_ugc_asset_id_key" ON "widget_items"("widget_id", "ugc_asset_id");

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_ugc_asset_id_fkey" FOREIGN KEY ("ugc_asset_id") REFERENCES "ugc_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_reviews" ADD CONSTRAINT "customer_reviews_review_request_id_fkey" FOREIGN KEY ("review_request_id") REFERENCES "review_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widget_items" ADD CONSTRAINT "widget_items_widget_id_fkey" FOREIGN KEY ("widget_id") REFERENCES "widgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widget_items" ADD CONSTRAINT "widget_items_ugc_asset_id_fkey" FOREIGN KEY ("ugc_asset_id") REFERENCES "ugc_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
