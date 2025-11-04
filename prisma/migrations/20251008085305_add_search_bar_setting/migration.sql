-- CreateTable
CREATE TABLE "public"."SearchBarSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "showKeyword" BOOLEAN NOT NULL DEFAULT true,
    "showPropertyType" BOOLEAN NOT NULL DEFAULT true,
    "showDealType" BOOLEAN NOT NULL DEFAULT true,
    "showPriceRange" BOOLEAN NOT NULL DEFAULT true,
    "showAreaRange" BOOLEAN NOT NULL DEFAULT true,
    "showTheme" BOOLEAN NOT NULL DEFAULT true,
    "showRooms" BOOLEAN NOT NULL DEFAULT true,
    "showFloor" BOOLEAN NOT NULL DEFAULT true,
    "showBathrooms" BOOLEAN NOT NULL DEFAULT true,
    "showSubwayLine" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchBarSetting_pkey" PRIMARY KEY ("id")
);
