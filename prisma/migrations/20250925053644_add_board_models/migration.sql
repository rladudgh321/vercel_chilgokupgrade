-- CreateTable
CREATE TABLE "public"."BoardCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BoardAnnouncement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BoardPost" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "popupContent" TEXT,
    "categoryId" INTEGER,
    "announcementId" INTEGER,
    "representativeImage" TEXT,
    "externalLink" TEXT,
    "registrationDate" TIMESTAMP(3),
    "manager" TEXT,
    "isAnnouncement" BOOLEAN NOT NULL DEFAULT false,
    "isPopup" BOOLEAN NOT NULL DEFAULT false,
    "popupWidth" INTEGER,
    "popupHeight" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BoardPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoardCategory_name_key" ON "public"."BoardCategory"("name");

-- AddForeignKey
ALTER TABLE "public"."BoardPost" ADD CONSTRAINT "BoardPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."BoardCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BoardPost" ADD CONSTRAINT "BoardPost_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "public"."BoardAnnouncement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
