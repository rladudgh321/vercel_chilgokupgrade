/*
  Warnings:

  - You are about to drop the column `externalLink` on the `BoardPost` table. All the data in the column will be lost.
  - You are about to drop the column `isAnnouncement` on the `BoardPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."BoardPost" DROP COLUMN "externalLink",
DROP COLUMN "isAnnouncement",
ADD COLUMN     "categoryId" INTEGER;

-- CreateTable
CREATE TABLE "public"."BoardCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoardCategory_name_key" ON "public"."BoardCategory"("name");

-- CreateIndex
CREATE INDEX "BoardPost_categoryId_idx" ON "public"."BoardPost"("categoryId");

-- AddForeignKey
ALTER TABLE "public"."BoardPost" ADD CONSTRAINT "BoardPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."BoardCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
