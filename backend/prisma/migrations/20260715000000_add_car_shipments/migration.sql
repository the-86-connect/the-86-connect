-- CreateTable
CREATE TABLE "car_shipments" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "car_model" TEXT NOT NULL,
    "car_year" TEXT,
    "vin_number" TEXT,
    "origin_port" TEXT,
    "destination_port" TEXT,
    "container_number" TEXT,
    "vessel_name" TEXT,
    "estimated_departure" TIMESTAMP(3),
    "estimated_arrival" TIMESTAMP(3),
    "actual_departure" TIMESTAMP(3),
    "actual_arrival" TIMESTAMP(3),
    "tracking_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_shipments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "car_shipments_submission_id_key" ON "car_shipments"("submission_id");

-- CreateIndex
CREATE INDEX "car_shipments_submission_id_idx" ON "car_shipments"("submission_id");

-- AddForeignKey
ALTER TABLE "car_shipments" ADD CONSTRAINT "car_shipments_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
