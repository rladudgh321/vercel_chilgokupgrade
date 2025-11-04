-- CreateTable: ContactRequest
CREATE TABLE "public"."ContactRequest" (
  "id" SERIAL PRIMARY KEY,
  "confirm" BOOLEAN NOT NULL DEFAULT false,
  "author" TEXT NOT NULL,
  "contact" TEXT NOT NULL,
  "ipAddress" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "note" TEXT,
  "date" TIMESTAMP(3) NOT NULL,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Optional index to search by contact or description
CREATE INDEX IF NOT EXISTS "ContactRequest_contact_idx" ON "public"."ContactRequest" ("contact");
CREATE INDEX IF NOT EXISTS "ContactRequest_date_idx" ON "public"."ContactRequest" ("date");

