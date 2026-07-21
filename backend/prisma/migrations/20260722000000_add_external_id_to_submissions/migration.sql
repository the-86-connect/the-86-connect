-- Add externalId column to submissions table
-- Used to link submissions with quotes on the cars app (cars.the86connect.com)
ALTER TABLE "submissions" ADD COLUMN "externalId" TEXT;

-- Create unique index on externalId (multiple NULLs are allowed in PostgreSQL)
CREATE UNIQUE INDEX "submissions_externalId_key" ON "submissions"("externalId");
