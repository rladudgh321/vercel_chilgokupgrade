/*
  Warnings:

  - You are about to drop the column `announcementId` on the `BoardPost` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `BoardPost` table. All the data in the column will be lost.
  - You are about to drop the `BoardAnnouncement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BoardCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."BoardPost" DROP CONSTRAINT "BoardPost_announcementId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BoardPost" DROP CONSTRAINT "BoardPost_categoryId_fkey";

-- AlterTable
ALTER TABLE "public"."BoardPost" DROP COLUMN "announcementId",
DROP COLUMN "categoryId";

-- DropTable
DROP TABLE "public"."BoardAnnouncement";

-- DropTable
DROP TABLE "public"."BoardCategory";
