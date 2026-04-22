require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql/msnodesqlv8'); 

const app = express();
const PORT = process.env.PORT || 5000;

//เพิ่ม limit เป็น 50mb เพื่อให้รับไฟล์รูปภาพได้
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ตั้งค่าการเชื่อมต่อแบบ Windows Authentication (อัปเดตชื่อ Driver)
const dbConfig = {
    server: 'localhost\\SQLEXPRESS',
    database: 'ClothyDB',
    // ระบุชื่อ ODBC Driver ที่มาพร้อมกับ SQL Server เวอร์ชั่นใหม่ๆ
    driver: 'ODBC Driver 17 for SQL Server', 
    options: {
        trustedConnection: true, 
        trustServerCertificate: true 
    }
};

// ทดสอบการเชื่อมต่อ Database
sql.connect(dbConfig).then(() => {
    console.log('✅ เชื่อมต่อ SQL Server (ClothyDB) ด้วย Windows Auth สำเร็จแล้ว!');
}).catch(err => {
    console.error('❌ ไม่สามารถเชื่อมต่อฐานข้อมูลได้:', err.message);
});

app.get('/', (req, res) => {
    res.send('ยินดีต้อนรับสู่ Clothy API Backend!');
});

// ==========================================
// API สำหรับจัดการข้อมูลลูกค้า (Customers)
// ==========================================

// 1. API ดึงรายชื่อลูกค้าทั้งหมด (ใช้ตอนเปิดหน้าเว็บ)
app.get('/api/customers', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Customers');
        res.json(result.recordset); // ส่งข้อมูลกลับไปให้ React เป็นก้อน JSON
    } catch (err) {
        console.error(err);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า');
    }
});

// 2. API เพิ่มลูกค้าใหม่ (ใช้ตอนกดปุ่ม "ลงทะเบียน" ในหน้าแรก)
app.post('/api/customers', async (req, res) => {
    try {
        // รับข้อมูลที่ React ส่งมาให้
        const { name, phone, dept, address } = req.body;
        
        // สร้างรหัสลูกค้าใหม่ (เช่น c1712345678)
        const customerId = 'c' + Date.now(); 

        const pool = await sql.connect(dbConfig);
        
        // ใช้ .input() ป้องกันการโดนแฮกแบบ SQL Injection (ปลอดภัย 100%)
        await pool.request()
            .input('CustomerID', sql.VarChar(20), customerId)
            .input('Name', sql.NVarChar(100), name)
            .input('Phone', sql.VarChar(15), phone)
            .input('Department', sql.NVarChar(100), dept || null)
            .input('Address', sql.NVarChar(sql.MAX), address || null)
            .query(`
                INSERT INTO Customers (CustomerID, Name, Phone, Department, Address) 
                VALUES (@CustomerID, @Name, @Phone, @Department, @Address)
            `);
        
        // ส่งข้อความกลับไปบอก React ว่าบันทึกสำเร็จ!
        res.status(201).json({ message: 'เพิ่มลูกค้าสำเร็จ!', customerId });
    } catch (err) {
        console.error(err);
        res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มลูกค้า');
    }
});

// ==========================================
// API สำหรับจัดการข้อมูลชุดสั่งตัด (Outfits)
// ==========================================

// 1. API ดึงข้อมูลชุดสั่งตัดทั้งหมด
app.get('/api/outfits', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Outfits');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลชุด');
    }
});

// 2. API เพิ่มชุดสั่งตัดใหม่
app.post('/api/outfits', async (req, res) => {
    try {
        const { customerId, name } = req.body;
        const outfitId = 'o' + Date.now(); // สร้างรหัสชุดใหม่

        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('OutfitID', sql.VarChar(20), outfitId)
            .input('CustomerID', sql.VarChar(20), customerId)
            .input('Name', sql.NVarChar(100), name)
            .query(`
                INSERT INTO Outfits (OutfitID, CustomerID, Name) 
                VALUES (@OutfitID, @CustomerID, @Name)
            `);
        
        res.status(201).json({ message: 'เพิ่มชุดใหม่สำเร็จ!', outfitId });
    } catch (err) {
        console.error(err);
        res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มชุด');
    }
});

// 3. API อัปเดตข้อมูลชุดและสัดส่วน (ใช้ตอนกดปุ่ม 'บันทึกรายละเอียด' หรือเปลี่ยนสถานะ)
app.put('/api/outfits/:id', async (req, res) => {
    try {
        const outfitId = req.params.id;
        
        // รับค่าทั้งหมดที่ React ส่งมา
        const {
            status, price, deposit, remaining, orderDate, deliveryDate,
            chest, waist, hips, shirtLength
        } = req.body;

        const pool = await sql.connect(dbConfig);
        
        // ใช้คำสั่ง UPDATE ของ SQL
        await pool.request()
            .input('OutfitID', sql.VarChar(20), outfitId)
            .input('Status', sql.NVarChar(20), status)
            .input('Price', sql.Decimal(10,2), price || 0)
            .input('Deposit', sql.Decimal(10,2), deposit || 0)
            .input('Remaining', sql.Decimal(10,2), remaining || 0)
            .input('OrderDate', sql.Date, orderDate || null)
            .input('DeliveryDate', sql.Date, deliveryDate || null)
            .input('Chest', sql.Decimal(5,2), chest || null)
            .input('Waist', sql.Decimal(5,2), waist || null)
            .input('Hips', sql.Decimal(5,2), hips || null)
            .input('ShirtLength', sql.Decimal(5,2), shirtLength || null)
            .query(`
                UPDATE Outfits 
                SET Status = @Status, Price = @Price, Deposit = @Deposit, Remaining = @Remaining,
                    OrderDate = @OrderDate, DeliveryDate = @DeliveryDate,
                    Chest = @Chest, Waist = @Waist, Hips = @Hips, ShirtLength = @ShirtLength
                WHERE OutfitID = @OutfitID
            `);

        res.json({ message: 'อัปเดตข้อมูลชุดสำเร็จ!' });
    } catch (err) {
        console.error(err);
        res.status(500).send('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    }
});

// 4. API สำหรับลบชุดสั่งตัด
app.delete('/api/outfits/:id', async (req, res) => {
    try {
        const outfitId = req.params.id;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('OutfitID', sql.VarChar(20), outfitId)
            .query('DELETE FROM Outfits WHERE OutfitID = @OutfitID');
        res.json({ message: 'ลบชุดสำเร็จ!' });
    } catch (err) {
        console.error(err);
        res.status(500).send('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
});

// 5. API สำหรับเปลี่ยนชื่อชุด
app.put('/api/outfits/:id/rename', async (req, res) => {
    try {
        const outfitId = req.params.id;
        const { newName } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('OutfitID', sql.VarChar(20), outfitId)
            .input('NewName', sql.NVarChar(100), newName)
            .query('UPDATE Outfits SET Name = @NewName WHERE OutfitID = @OutfitID');
        res.json({ message: 'เปลี่ยนชื่อชุดสำเร็จ!' });
    } catch (err) {
        console.error(err);
        res.status(500).send('เกิดข้อผิดพลาดในการเปลี่ยนชื่อ');
    }
});

// ==========================================
// API สำหรับจัดการรูปภาพ (Photos)
// ==========================================

app.get('/api/photos', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Photos');
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
});

// [อัปเดต] API เพิ่มรูปภาพ (รับไฟล์ Base64 และ Caption พร้อมกัน)
app.post('/api/photos', async (req, res) => {
    try {
        const { outfitId, url, caption } = req.body;
        const photoId = 'p' + Date.now(); 

        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('PhotoID', sql.VarChar(20), photoId)
            .input('OutfitID', sql.VarChar(20), outfitId)
            .input('PhotoURL', sql.NVarChar(sql.MAX), url) // เก็บเป็น Base64
            .input('Caption', sql.NVarChar(255), caption || '')
            .query(`
                INSERT INTO Photos (PhotoID, OutfitID, PhotoURL, Caption) 
                VALUES (@PhotoID, @OutfitID, @PhotoURL, @Caption)
            `);
        res.status(201).json({ message: 'บันทึกรูปสำเร็จ!', photoId });
    } catch (err) { res.status(500).send(err.message); }
});

app.put('/api/photos/:id/caption', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('PhotoID', sql.VarChar(20), req.params.id)
            .input('Caption', sql.NVarChar(255), req.body.caption)
            .query(`UPDATE Photos SET Caption = @Caption WHERE PhotoID = @PhotoID`);
        res.json({ message: 'อัปเดตแคปชั่นสำเร็จ!' });
    } catch (err) { res.status(500).send(err.message); }
});

// [เพิ่มใหม่] API สำหรับลบรูปภาพ
app.delete('/api/photos/:id', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('PhotoID', sql.VarChar(20), req.params.id)
            .query(`DELETE FROM Photos WHERE PhotoID = @PhotoID`);
        res.json({ message: 'ลบรูปสำเร็จ!' });
    } catch (err) { res.status(500).send(err.message); }
});

app.listen(PORT, () => {
    console.log(`🚀 Server เปิดทำงานแล้วที่พอร์ต http://localhost:${PORT}`);
});