-- CreateTable
CREATE TABLE "public"."BannedIp" (
    "id" SERIAL NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "reason" TEXT,
    "contact" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannedIp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BannedIp_ipAddress_key" ON "public"."BannedIp"("ipAddress");
