/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."AddressPublic" AS ENUM ('public', 'private', 'exclude');

-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "public"."Post";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."Build" (
    "id" SERIAL NOT NULL,
    "address" TEXT,
    "dong" TEXT,
    "ho" TEXT,
    "etc" TEXT,
    "isAddressPublic" "public"."AddressPublic" DEFAULT 'public',
    "mapLocation" TEXT,
    "propertyType" TEXT,
    "dealType" TEXT,
    "dealScope" TEXT,
    "visibility" BOOLEAN DEFAULT true,
    "priceDisplay" TEXT,
    "salePrice" INTEGER,
    "actualEntryCost" INTEGER,
    "rentalPrice" INTEGER,
    "managementFee" INTEGER,
    "managementEtc" TEXT,
    "popularity" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "label" TEXT,
    "floorType" TEXT,
    "currentFloor" INTEGER,
    "totalFloors" INTEGER,
    "basementFloors" INTEGER,
    "floorDescription" TEXT,
    "rooms" INTEGER,
    "bathrooms" INTEGER,
    "actualArea" DOUBLE PRECISION,
    "supplyArea" DOUBLE PRECISION,
    "landArea" DOUBLE PRECISION,
    "buildingArea" DOUBLE PRECISION,
    "totalArea" DOUBLE PRECISION,
    "themes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "buildingOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "constructionYear" TIMESTAMP(3),
    "permitDate" TIMESTAMP(3),
    "approvalDate" TIMESTAMP(3),
    "parkingPerUnit" INTEGER,
    "totalParking" INTEGER,
    "parkingFee" INTEGER,
    "parking" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "direction" TEXT,
    "directionBase" TEXT,
    "landUse" TEXT,
    "landType" TEXT,
    "buildingUse" TEXT,
    "staff" TEXT,
    "customerType" TEXT,
    "customerName" TEXT,
    "elevatorType" TEXT,
    "elevatorCount" INTEGER,
    "moveInType" TEXT,
    "moveInDate" TIMESTAMP(3),
    "heatingType" TEXT,
    "yieldType" TEXT,
    "otherYield" TEXT,
    "contractEndDate" TIMESTAMP(3),
    "buildingName" TEXT,
    "floorAreaRatio" TEXT,
    "otherUse" TEXT,
    "mainStructure" TEXT,
    "height" TEXT,
    "roofStructure" TEXT,
    "title" TEXT,
    "editorContent" TEXT,
    "secretNote" TEXT,
    "secretContact" TEXT,
    "mainImage" TEXT,
    "subImage" JSONB,
    "adminImage" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Build_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Contact" (
    "id" SERIAL NOT NULL,
    "customerText" TEXT NOT NULL,
    "customerPhoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);
