/*
  Warnings:

  - You are about to drop the column `buildingOptions` on the `Build` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `Build` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Build" DROP COLUMN "buildingOptions",
DROP COLUMN "label",
ADD COLUMN     "labelId" INTEGER;

-- CreateTable
CREATE TABLE "public"."ListingType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BuildingOption" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuildingOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Label" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_BuildToBuildingOption" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BuildToBuildingOption_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingType_name_key" ON "public"."ListingType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BuildingOption_name_key" ON "public"."BuildingOption"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Label_name_key" ON "public"."Label"("name");

-- CreateIndex
CREATE INDEX "_BuildToBuildingOption_B_index" ON "public"."_BuildToBuildingOption"("B");

-- AddForeignKey
ALTER TABLE "public"."Build" ADD CONSTRAINT "Build_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "public"."Label"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BuildToBuildingOption" ADD CONSTRAINT "_BuildToBuildingOption_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Build"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BuildToBuildingOption" ADD CONSTRAINT "_BuildToBuildingOption_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."BuildingOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
