-- AlterTable
ALTER TABLE "public"."Build" ADD COLUMN     "listingTypeId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Build" ADD CONSTRAINT "Build_listingTypeId_fkey" FOREIGN KEY ("listingTypeId") REFERENCES "public"."ListingType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
