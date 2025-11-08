/*
  Warnings:

  - You are about to drop the column `mapLocation` on the `Build` table. All the data in the column will be lost.
  - Made the column `views` on table `Build` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BoardPost" ADD COLUMN     "isAnnouncement" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Build" DROP COLUMN "mapLocation",
ALTER COLUMN "views" SET NOT NULL;
