-- AlterTable
ALTER TABLE "public"."BathroomOption" ADD COLUMN     "imageName" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."BuildingOption" ADD COLUMN     "imageName" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."FloorOption" ADD COLUMN     "imageName" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."RoomOption" ADD COLUMN     "imageName" TEXT,
ADD COLUMN     "imageUrl" TEXT;
