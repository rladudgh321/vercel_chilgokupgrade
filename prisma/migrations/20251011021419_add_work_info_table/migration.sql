-- CreateTable
CREATE TABLE "public"."WorkInfo" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "companyName" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "owner" TEXT,
    "businessId" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkInfo_pkey" PRIMARY KEY ("id")
);
