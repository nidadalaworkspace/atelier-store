DROP INDEX "cart_items_cart_product_size_unique";--> statement-breakpoint
WITH ranked AS (
  SELECT
    "id",
    LEAST(
      99,
      SUM("quantity") OVER (PARTITION BY "cart_id", "product_id", "size")
    )::integer AS merged_quantity,
    ROW_NUMBER() OVER (
      PARTITION BY "cart_id", "product_id", "size"
      ORDER BY "id"
    ) AS row_num
  FROM "cart_items"
)
UPDATE "cart_items" AS item
SET "quantity" = ranked.merged_quantity
FROM ranked
WHERE item."id" = ranked."id" AND ranked.row_num = 1;
--> statement-breakpoint
WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "cart_id", "product_id", "size"
      ORDER BY "id"
    ) AS row_num
  FROM "cart_items"
)
DELETE FROM "cart_items" AS item
USING ranked
WHERE item."id" = ranked."id" AND ranked.row_num > 1;
--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_product_size_unique" UNIQUE NULLS NOT DISTINCT("cart_id","product_id","size");