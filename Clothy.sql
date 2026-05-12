
-- 1. สร้าง Database
CREATE DATABASE Clothy_Database;
GO

-- 2. เลือกใช้งาน Database
USE Clothy_Database;
GO

-- 3. สร้างตาราง Customers
CREATE TABLE Customers (
    CustomerID  VARCHAR(20)    NOT NULL PRIMARY KEY,
    Name        NVARCHAR(100)  NOT NULL,
    Phone       VARCHAR(15)    NOT NULL,
    Department  NVARCHAR(100)  NULL,
    Address     NVARCHAR(MAX)  NULL
);
GO

-- 4. สร้างตาราง Outfits
CREATE TABLE Outfits (
    OutfitID      VARCHAR(20)    NOT NULL PRIMARY KEY,
    CustomerID    VARCHAR(20)    NOT NULL,
    Name          NVARCHAR(100)  NOT NULL,
    Status        NVARCHAR(20)   NULL DEFAULT 'รอดำเนินการ',

    -- การเงิน
    UnitPrice     DECIMAL(10,2)  NULL,
    Quantity      INT            NULL DEFAULT 1,
    Price         DECIMAL(10,2)  NULL DEFAULT 0.00,
    Deposit       DECIMAL(10,2)  NULL DEFAULT 0.00,
    Remaining     DECIMAL(10,2)  NULL DEFAULT 0.00,
    OrderDate     DATE           NULL,
    DeliveryDate  DATE           NULL,

    -- สัดส่วนท่อนบน
    FrontLength   DECIMAL(5,2)   NULL,
    BackLength    DECIMAL(5,2)   NULL,
    FrontShoulder DECIMAL(5,2)   NULL,
    BackShoulder  DECIMAL(5,2)   NULL,
    Shoulder      DECIMAL(5,2)   NULL,
    Neck          DECIMAL(5,2)   NULL,
    Chest         DECIMAL(5,2)   NULL,
    ChestHeight   DECIMAL(5,2)   NULL,
    ChestDistance DECIMAL(5,2)   NULL,
    TopWaist      DECIMAL(5,2)   NULL,
    TopBelly      DECIMAL(5,2)   NULL,
    TopHips       DECIMAL(5,2)   NULL,
    ShirtLength   DECIMAL(5,2)   NULL,

    -- สัดส่วนท่อนแขน
    Armpit        DECIMAL(5,2)   NULL,
    ArmWidth      DECIMAL(5,2)   NULL,
    ArmLength     DECIMAL(5,2)   NULL,
    Wrist         DECIMAL(5,2)   NULL,

    -- สัดส่วนท่อนล่าง
    BottomWaist   DECIMAL(5,2)   NULL,
    BottomBelly   DECIMAL(5,2)   NULL,
    BottomHips    DECIMAL(5,2)   NULL,
    SkirtLength   DECIMAL(5,2)   NULL,
    CrotchDepth   DECIMAL(5,2)   NULL,
    Crotch        DECIMAL(5,2)   NULL,
    Thigh         DECIMAL(5,2)   NULL,
    PantsLength   DECIMAL(5,2)   NULL,
    LegOpening    DECIMAL(5,2)   NULL,

    -- Foreign Key
    CONSTRAINT FK_Outfits_Customers
        FOREIGN KEY (CustomerID)
        REFERENCES Customers(CustomerID)
        ON DELETE CASCADE
);
GO

-- 5. สร้างตาราง Photos
CREATE TABLE Photos (
    PhotoID   VARCHAR(20)    NOT NULL PRIMARY KEY,
    OutfitID  VARCHAR(20)    NOT NULL,
    PhotoURL  NVARCHAR(MAX)  NOT NULL,
    Caption   NVARCHAR(255)  NULL,

    -- Foreign Key
    CONSTRAINT FK_Photos_Outfits
        FOREIGN KEY (OutfitID)
        REFERENCES Outfits(OutfitID)
        ON DELETE CASCADE
);
GO