-- ดูทุก table ใน database
USE Clothy_DataBase;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;

-- ดูข้อมูลลูกค้า
SELECT * FROM Customers;

-- ดูข้อมูลชุด
SELECT * FROM Outfits;

-- ดูรูปภาพ
SELECT * FROM Photos;