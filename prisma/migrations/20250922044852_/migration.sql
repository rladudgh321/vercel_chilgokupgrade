-- AlterTable
ALTER TABLE "public"."Build" ALTER COLUMN "popularity" DROP NOT NULL,
ALTER COLUMN "popularity" DROP DEFAULT,
ALTER COLUMN "popularity" SET DATA TYPE TEXT;
