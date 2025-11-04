-- CreateTable
CREATE TABLE "WebViewBanner" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageName" TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebViewBanner_pkey" PRIMARY KEY ("id")
);
