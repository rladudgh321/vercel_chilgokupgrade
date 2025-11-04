-- CreateTable
CREATE TABLE "public"."FloorOption" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FloorOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FloorOption_name_key" ON "public"."FloorOption"("name");

-- AddForeignKey
ALTER TABLE "public"."Build" ADD CONSTRAINT "Build_floorOptionId_fkey" FOREIGN KEY ("floorOptionId") REFERENCES "public"."FloorOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
