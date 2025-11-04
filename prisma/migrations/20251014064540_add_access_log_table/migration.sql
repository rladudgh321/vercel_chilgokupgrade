-- CreateTable
CREATE TABLE "access_logs" (
    "id" SERIAL NOT NULL,
    "ip" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "referrer" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_logs_pkey" PRIMARY KEY ("id")
);
