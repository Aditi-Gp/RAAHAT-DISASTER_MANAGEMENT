-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'VOLUNTEER', 'ADMIN', 'DEPARTMENT', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "SOSStatus" AS ENUM ('NEW', 'ASSIGNED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "DisasterType" AS ENUM ('FLOOD', 'FIRE', 'EARTHQUAKE', 'CYCLONE');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "location" Point,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "governmentIdUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sos_requests" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "location" Point NOT NULL,
    "status" "SOSStatus" NOT NULL DEFAULT 'NEW',
    "category" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "createdById" INTEGER NOT NULL,
    "assignedToId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sos_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disaster_events" (
    "id" SERIAL NOT NULL,
    "eventName" TEXT NOT NULL,
    "disasterType" "DisasterType" NOT NULL,
    "affectedArea" Polygon NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disaster_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "sos_requests_location_idx" ON "sos_requests" USING GIST ("location");

-- CreateIndex
CREATE INDEX "disaster_events_affectedArea_idx" ON "disaster_events" USING GIST ("affectedArea");

-- AddForeignKey
ALTER TABLE "sos_requests" ADD CONSTRAINT "sos_requests_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sos_requests" ADD CONSTRAINT "sos_requests_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
