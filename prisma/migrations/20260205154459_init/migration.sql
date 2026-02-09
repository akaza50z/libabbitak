-- CreateTable
CREATE TABLE "RestaurantSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantName" TEXT NOT NULL DEFAULT 'المطعم',
    "phone" TEXT DEFAULT '',
    "whatsapp" TEXT DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT 'IQD',
    "logoUrl" TEXT DEFAULT '',
    "mode" TEXT NOT NULL DEFAULT 'dine-in',
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "messageFooter" TEXT DEFAULT 'شكراً لزيارتكم',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name_ar" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "desc_ar" TEXT DEFAULT '',
    "priceInt" INTEGER NOT NULL,
    "imagePath" TEXT DEFAULT '',
    "imageUrl" TEXT DEFAULT '',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");
