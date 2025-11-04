-- CreateTable
CREATE TABLE "public"."PricePreset" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    "buyTypeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricePreset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PricePreset" ADD CONSTRAINT "PricePreset_buyTypeId_fkey" FOREIGN KEY ("buyTypeId") REFERENCES "public"."BuyType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
