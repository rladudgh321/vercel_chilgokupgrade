-- CreateTable
CREATE TABLE "public"."Order" (
    "id" SERIAL NOT NULL,
    "confirm" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "estimatedAmount" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
