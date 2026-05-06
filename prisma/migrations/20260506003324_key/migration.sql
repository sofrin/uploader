-- DropIndex
DROP INDEX "file_id_idx";

-- CreateIndex
CREATE INDEX "file_id_key_idx" ON "file"("id", "key");
