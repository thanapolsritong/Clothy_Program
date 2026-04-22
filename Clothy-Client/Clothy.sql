-- 1. สร้างฐานข้อมูลใหม่ชื่อ ClothyDB
CREATE DATABASE ClothyDB;
GO

-- 2. เลือกใช้งานฐานข้อมูลที่เพิ่งสร้าง
USE ClothyDB;
GO

-- 3. สร้างตาราง Customers (ลูกค้า)
CREATE TABLE Customers (
    CustomerID VARCHAR(20) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Phone VARCHAR(15) NOT NULL,
    Department NVARCHAR(100) NULL,
    Address NVARCHAR(MAX) NULL
);
GO

-- 4. สร้างตาราง Outfits (ชุดสั่งตัด)
CREATE TABLE Outfits (
    OutfitID VARCHAR(20) PRIMARY KEY,
    CustomerID VARCHAR(20) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'รอดำเนินการ',
    Price DECIMAL(10,2) DEFAULT 0.00,
    Deposit DECIMAL(10,2) DEFAULT 0.00,
    Remaining DECIMAL(10,2) DEFAULT 0.00,
    OrderDate DATE NULL,
    DeliveryDate DATE NULL,
    Chest DECIMAL(5,2) NULL,
    Waist DECIMAL(5,2) NULL,
    Hips DECIMAL(5,2) NULL,
    ShirtLength DECIMAL(5,2) NULL,
    
    -- สร้าง Foreign Key เชื่อมกับตาราง Customers
    CONSTRAINT FK_Outfits_Customers FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID) ON DELETE CASCADE
);
GO

-- 5. สร้างตาราง Photos (รูปภาพ)
CREATE TABLE Photos (
    PhotoID VARCHAR(20) PRIMARY KEY,
    OutfitID VARCHAR(20) NOT NULL,
    PhotoURL NVARCHAR(MAX) NOT NULL,
    Caption NVARCHAR(255) NULL,
    
    -- สร้าง Foreign Key เชื่อมกับตาราง Outfits
    CONSTRAINT FK_Photos_Outfits FOREIGN KEY (OutfitID) REFERENCES Outfits(OutfitID) ON DELETE CASCADE
);
GO

PRINT 'สร้างฐานข้อมูลและตาราง ClothyDB สำเร็จเรียบร้อย!';