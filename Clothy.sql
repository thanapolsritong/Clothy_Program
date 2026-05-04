-- 1. สร้างฐานข้อมูลใหม่ชื่อ Clothy_DataBase
CREATE DATABASE Clothy_DataBase;
GO

-- 2. เลือกใช้งานฐานข้อมูลที่เพิ่งสร้าง
USE Clothy_DataBase;
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

PRINT 'สร้างฐานข้อมูลและตาราง Clothy_DataBase สำเร็จเรียบร้อย!';

-- เพิ่ม collumn จำนวนชุด
ALTER TABLE Outfits ADD Quantity INT NULL DEFAULT 1;
ALTER TABLE Outfits ADD UnitPrice DECIMAL(10,2) NULL;

-- เพิ่ม collumn สัดส่วน
ALTER TABLE Outfits ADD
  FrontLength   DECIMAL(5,2) NULL,
  BackLength    DECIMAL(5,2) NULL,
  FrontShoulder DECIMAL(5,2) NULL,
  BackShoulder  DECIMAL(5,2) NULL,
  Shoulder      DECIMAL(5,2) NULL,
  Neck          DECIMAL(5,2) NULL,
  ChestHeight   DECIMAL(5,2) NULL,
  ChestDistance DECIMAL(5,2) NULL,
  TopWaist      DECIMAL(5,2) NULL,
  TopBelly      DECIMAL(5,2) NULL,
  TopHips       DECIMAL(5,2) NULL,
  Armpit        DECIMAL(5,2) NULL,
  ArmWidth      DECIMAL(5,2) NULL,
  ArmLength     DECIMAL(5,2) NULL,
  Wrist         DECIMAL(5,2) NULL,
  BottomWaist   DECIMAL(5,2) NULL,
  BottomBelly   DECIMAL(5,2) NULL,
  BottomHips    DECIMAL(5,2) NULL,
  SkirtLength   DECIMAL(5,2) NULL,
  CrotchDepth   DECIMAL(5,2) NULL,
  Crotch        DECIMAL(5,2) NULL,
  Thigh         DECIMAL(5,2) NULL,
  PantsLength   DECIMAL(5,2) NULL,
  LegOpening    DECIMAL(5,2) NULL;