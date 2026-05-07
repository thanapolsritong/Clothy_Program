-- ดูทุก table ใน database
USE Clothy_DataBase;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;

-- ดูข้อมูลทั้งหมดในแต่ละตาราง
SELECT * FROM Customers;
SELECT * FROM Outfits;
SELECT * FROM Photos;

-- ดูโครงสร้างตาราง (columns + data types)
EXEC sp_help 'Customers';
EXEC sp_help 'Outfits';
EXEC sp_help 'Photos';

-- ดูแบบ JOIN (ลูกค้า + ชุด)
SELECT 
    c.CustomerID, c.Name AS ลูกค้า, c.Phone,
    o.OutfitID, o.Name AS ชุด, o.Status,
    o.Price, o.Deposit, o.Remaining
FROM Customers c
LEFT JOIN Outfits o ON c.CustomerID = o.CustomerID;

-- ดูแบบ JOIN (ชุด + รูปภาพ)
SELECT 
    o.OutfitID, o.Name AS ชุด,
    p.PhotoID, p.Caption
FROM Outfits o
LEFT JOIN Photos p ON o.OutfitID = p.OutfitID;