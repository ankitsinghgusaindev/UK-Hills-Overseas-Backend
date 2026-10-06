-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "image" TEXT,
ADD COLUMN     "ingredients" TEXT,
ADD COLUMN     "nutrition" JSONB,
ADD COLUMN     "origin" TEXT,
ADD COLUMN     "rating" DECIMAL(65,30),
ADD COLUMN     "reviews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shelfLife" TEXT,
ADD COLUMN     "storage" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
