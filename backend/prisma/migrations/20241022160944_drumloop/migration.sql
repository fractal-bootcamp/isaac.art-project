-- CreateTable
CREATE TABLE "DrumLoop" (
    "id" TEXT NOT NULL,
    "bpm" INTEGER NOT NULL DEFAULT 120,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrumLoop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "instrument" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "drumLoopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_drumLoopId_fkey" FOREIGN KEY ("drumLoopId") REFERENCES "DrumLoop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
