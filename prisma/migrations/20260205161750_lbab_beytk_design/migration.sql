-- AlterTable
ALTER TABLE "Category" ADD COLUMN "imageUrl" TEXT DEFAULT '';

-- AlterTable
ALTER TABLE "Item" ADD COLUMN "oldPriceInt" INTEGER;

-- AlterTable
ALTER TABLE "RestaurantSettings" ADD COLUMN "address" TEXT DEFAULT '';
ALTER TABLE "RestaurantSettings" ADD COLUMN "extraInfo" TEXT DEFAULT '';
ALTER TABLE "RestaurantSettings" ADD COLUMN "facebookUrl" TEXT DEFAULT '';
ALTER TABLE "RestaurantSettings" ADD COLUMN "instagramUrl" TEXT DEFAULT '';
ALTER TABLE "RestaurantSettings" ADD COLUMN "wifiPassword" TEXT DEFAULT '';
