-- CreateEnum
CREATE TYPE "public"."PopupType" AS ENUM ('IMAGE', 'CONTENT');

-- AlterTable
ALTER TABLE "public"."BoardPost" ADD COLUMN     "popupType" "public"."PopupType" NOT NULL DEFAULT 'IMAGE';
