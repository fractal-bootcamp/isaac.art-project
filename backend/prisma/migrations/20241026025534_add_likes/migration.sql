-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "drumLoopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_drumLoopId_key" ON "Like"("userId", "drumLoopId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_drumLoopId_fkey" FOREIGN KEY ("drumLoopId") REFERENCES "DrumLoop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
