/*
  Warnings:

  - You are about to drop the column `dealType` on the `Build` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Build" DROP COLUMN "dealType",
ADD COLUMN     "buyTypeId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Build" ADD CONSTRAINT "Build_buyTypeId_fkey" FOREIGN KEY ("buyTypeId") REFERENCES "public"."BuyType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
