-- AlterTable
ALTER TABLE "public"."Build" ADD COLUMN     "deposit" INTEGER,
ADD COLUMN     "halfLumpSumMonthlyRent" INTEGER,
ADD COLUMN     "isActualEntryCostEnabled" BOOLEAN DEFAULT false,
ADD COLUMN     "isDepositEnabled" BOOLEAN DEFAULT false,
ADD COLUMN     "isHalfLumpSumMonthlyRentEnabled" BOOLEAN DEFAULT false,
ADD COLUMN     "isLumpSumPriceEnabled" BOOLEAN DEFAULT false,
ADD COLUMN     "isManagementFeeEnabled" BOOLEAN DEFAULT false,
ADD COLUMN     "isRentalPriceEnabled" BOOLEAN DEFAULT false,
ADD COLUMN     "isSalePriceEnabled" BOOLEAN DEFAULT false,
ADD COLUMN     "lumpSumPrice" INTEGER;
