-- AlterTable
ALTER TABLE "public"."BuildingOption" ADD COLUMN     "order" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."BuyType" ADD COLUMN     "order" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Label" ADD COLUMN     "order" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."ListingType" ADD COLUMN     "order" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."ThemeImage" ADD COLUMN     "order" INTEGER DEFAULT 0;
