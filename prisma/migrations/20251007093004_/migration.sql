/*
  Warnings:

  - You are about to drop the column `bathrooms` on the `Build` table. All the data in the column will be lost.
  - You are about to drop the column `rooms` on the `Build` table. All the data in the column will be lost.
  - You are about to drop the `FloorOption` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Build" DROP COLUMN "bathrooms",
DROP COLUMN "rooms",
ADD COLUMN     "bathroomOptionId" INTEGER,
ADD COLUMN     "floorOptionId" INTEGER,
ADD COLUMN     "roomOptionId" INTEGER;

-- DropTable
DROP TABLE "public"."FloorOption";

-- AddForeignKey
ALTER TABLE "public"."Build" ADD CONSTRAINT "Build_roomOptionId_fkey" FOREIGN KEY ("roomOptionId") REFERENCES "public"."RoomOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Build" ADD CONSTRAINT "Build_bathroomOptionId_fkey" FOREIGN KEY ("bathroomOptionId") REFERENCES "public"."BathroomOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
