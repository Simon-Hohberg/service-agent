-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "UserTenant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserTenant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserTenant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceCall" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "protocol" TEXT NOT NULL,
    "submitted" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executed" DATETIME,
    "scheduled" DATETIME,
    CONSTRAINT "ServiceCall_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceCallFavorite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "serviceCallId" INTEGER NOT NULL,
    CONSTRAINT "ServiceCallFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServiceCallFavorite_serviceCallId_fkey" FOREIGN KEY ("serviceCallId") REFERENCES "ServiceCall" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTenant_userId_tenantId_key" ON "UserTenant"("userId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCallFavorite_userId_serviceCallId_key" ON "ServiceCallFavorite"("userId", "serviceCallId");
