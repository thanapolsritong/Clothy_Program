-- เลือกใช้งาน Database
USE Clothy_Database;
GO

-- Select ดูตารางทั้งหมด
SELECT * FROM Customers,Outfits,Photos;

-- ตาราง Customers
-- Select-CRUD
SELECT * FROM Customers;

--Insert-CRUD
INSERT INTO Customers (CustomerID, Name, Phone, Department, Address)
VALUES ('c001', 'นายทองดี ไม่มีฝาก', '0812345678', 'IT', '123 ถ.พหลโยธิน กรุงเทพฯ');

--Update-CRUD
UPDATE Customers
SET Name = 'ทองดี มีเก็บ',
    Department = 'Dev'
WHERE CustomerID = 'c001';

--Delete-CRUD
DELETE FROM Customers
WHERE CustomerID = 'c001';


-- ตาราง Outfits
-- INSERT — เพิ่มข้อมูลชุดสั่งตัดใหม่
INSERT INTO Outfits (OutfitID, CustomerID, Name, Status, UnitPrice, Quantity, Price, Deposit, Remaining, OrderDate, DeliveryDate)
VALUES ('o001', 'c001', 'ชุดสูทข้าราชการ', 'รอดำเนินการ', 2500.00, 2, 5000.00, 2000.00, 3000.00, '2025-01-10', '2025-02-01');

-- SELECT — ดูข้อมูลชุดพร้อมชื่อลูกค้า
SELECT o.OutfitID, o.Name AS ชุด, o.Status,
       o.Price, o.Deposit, o.Remaining,
       c.Name AS ลูกค้า
FROM Outfits o
JOIN Customers c ON o.CustomerID = c.CustomerID;

-- UPDATE — อัปเดตสถานะและยอดมัดจำ
UPDATE Outfits
SET Status = 'กำลังทำ', Deposit = 3000.00, Remaining = 2000.00
WHERE OutfitID = 'o001';

-- DELETE — ลบข้อมูลชุด
DELETE FROM Outfits
WHERE OutfitID = 'o001';

-- ตาราง Photos
-- INSERT — เพิ่มรูปภาพอ้างอิง
INSERT INTO Photos (PhotoID, OutfitID, PhotoURL, Caption)
VALUES ('p001', 'o001', 'https://www.toffyboutique.com/polo_collar/', 'แบบคอเสื้อที่ลูกค้าเลือก');

-- SELECT — ดูรูปภาพพร้อมชื่อชุด
SELECT p.PhotoID, p.Caption, o.Name AS ชุด, c.Name AS ลูกค้า
FROM Photos p
JOIN Outfits  o ON p.OutfitID  = o.OutfitID
JOIN Customers c ON o.CustomerID = c.CustomerID;

-- UPDATE — แก้ไขคำอธิบายรูปภาพ
UPDATE Photos
SET Caption = 'แบบคอเสื้อและลายผ้าที่ลูกค้าเลือก'
WHERE PhotoID = 'p001';

-- DELETE — ลบรูปภาพ
DELETE FROM Photos
WHERE PhotoID = 'p001';