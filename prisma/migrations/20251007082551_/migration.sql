-- CreateTable
CREATE TABLE "public"."RoomOption" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FloorOption" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FloorOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BathroomOption" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BathroomOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomOption_name_key" ON "public"."RoomOption"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FloorOption_name_key" ON "public"."FloorOption"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BathroomOption_name_key" ON "public"."BathroomOption"("name");
