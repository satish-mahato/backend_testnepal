/*
  Warnings:

  - You are about to drop the `galleryfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `galleryimg` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `noticeimage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `noticepdf` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `galleryfile` DROP FOREIGN KEY `GalleryFile_galleryImgId_fkey`;

-- DropTable
DROP TABLE `galleryfile`;

-- DropTable
DROP TABLE `galleryimg`;

-- DropTable
DROP TABLE `image`;

-- DropTable
DROP TABLE `noticeimage`;

-- DropTable
DROP TABLE `noticepdf`;
