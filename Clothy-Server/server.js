require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql/msnodesqlv8');

// ==========================================
// ERROR CLASSES — Exception Handling (OOP)
// ==========================================

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

class ResourceNotFoundException extends AppError {
  constructor(resource) {
    super(`ไม่พบข้อมูล: ${resource}`, 404);
  }
}

class DatabaseException extends AppError {
  constructor(message) {
    super(`เกิดข้อผิดพลาดฐานข้อมูล: ${message}`, 500);
  }
}

class ValidationException extends AppError {
  constructor(message) {
    super(`ข้อมูลไม่ถูกต้อง: ${message}`, 400);
  }
}

// ==========================================
// MODEL CLASSES — Encapsulation + Inheritance (OOP)
// ==========================================

class BaseModel {
  #id;

  constructor(id) {
    this.#id = id;
  }

  getId() { return this.#id; }

  toString() {
    return `[${this.constructor.name}] id=${this.#id}`;
  }

  toJSON() {
    return { id: this.#id };
  }
}

class Customer extends BaseModel {
  #name;
  #phone;
  #department;
  #address;

  constructor(id, name, phone, department = null, address = null) {
    super(id);
    this.#name       = name;
    this.#phone      = phone;
    this.#department = department;
    this.#address    = address;
  }

  getName()       { return this.#name; }
  getPhone()      { return this.#phone; }
  getDepartment() { return this.#department; }
  getAddress()    { return this.#address; }

  setName(name) {
    if (!name || name.trim() === '') throw new ValidationException('ชื่อลูกค้าต้องไม่ว่าง');
    this.#name = name;
  }

  toString() {
    return `[Customer] ${this.#name} (${this.#phone})`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      name:       this.#name,
      phone:      this.#phone,
      department: this.#department,
      address:    this.#address,
    };
  }
}

class Outfit extends BaseModel {
  #customerId;
  #name;
  #status;
  #measurements;

  constructor(id, customerId, name, status = 'รอดำเนินการ', measurements = {}) {
    super(id);
    this.#customerId   = customerId;
    this.#name         = name;
    this.#status       = status;
    this.#measurements = measurements;
  }

  getCustomerId()   { return this.#customerId; }
  getName()         { return this.#name; }
  getStatus()       { return this.#status; }
  getMeasurements() { return this.#measurements; }

  setName(name) {
    if (!name || name.trim() === '') throw new ValidationException('ชื่อชุดต้องไม่ว่าง');
    this.#name = name;
  }

  setStatus(status) {
    const allowed = ['รอดำเนินการ', 'กำลังทำ', 'เสร็จสิ้น'];
    if (!allowed.includes(status)) throw new ValidationException(`สถานะไม่ถูกต้อง: ${status}`);
    this.#status = status;
  }

  toString() {
    return `[Outfit] ${this.#name} — ${this.#status}`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      customerId: this.#customerId,
      name:       this.#name,
      status:     this.#status,
      ...this.#measurements,
    };
  }
}

class Photo extends BaseModel {
  #outfitId;
  #url;
  #caption;

  constructor(id, outfitId, url, caption = '') {
    super(id);
    this.#outfitId = outfitId;
    this.#url      = url;
    this.#caption  = caption;
  }

  getOutfitId() { return this.#outfitId; }
  getUrl()      { return this.#url; }
  getCaption()  { return this.#caption; }

  setCaption(caption) { this.#caption = caption; }

  toString() {
    return `[Photo] outfit=${this.#outfitId} caption="${this.#caption}"`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      outfitId: this.#outfitId,
      url:      this.#url,
      caption:  this.#caption,
    };
  }
}

// ==========================================
// DATABASE CONNECTION
// ==========================================

const dbConfig = {
  server: process.env.DB_SERVER ? `${process.env.DB_SERVER}\\SQLEXPRESS` : 'localhost\\SQLEXPRESS',
  database: process.env.DB_DATABASE || 'Clothy_DataBase',
  driver: 'ODBC Driver 17 for SQL Server',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
};

async function getPool() {
  try {
    return await sql.connect(dbConfig);
  } catch (err) {
    throw new DatabaseException(err.message);
  }
}

// ==========================================
// REPOSITORY CLASSES — JDBC Pattern (OOP)
// ==========================================

class CustomerRepository {
  async findAll() {
    try {
      const pool = await getPool();
      const result = await pool.request().query('SELECT * FROM Customers');
      return result.recordset.map(r =>
        new Customer(r.CustomerID, r.Name, r.Phone, r.Department, r.Address)
      );
    } catch (err) {
      throw err instanceof AppError ? err : new DatabaseException(err.message);
    }
  }

  async create(name, phone, dept, address) {
    if (!name || !phone) throw new ValidationException('ชื่อและเบอร์โทรต้องไม่ว่าง');
    try {
      const id = 'c' + Date.now();
      const pool = await getPool();
      await pool.request()
        .input('CustomerID', sql.VarChar(20), id)
        .input('Name',       sql.NVarChar(100), name)
        .input('Phone',      sql.VarChar(15), phone)
        .input('Department', sql.NVarChar(100), dept || null)
        .input('Address',    sql.NVarChar(sql.MAX), address || null)
        .query('INSERT INTO Customers (CustomerID, Name, Phone, Department, Address) VALUES (@CustomerID, @Name, @Phone, @Department, @Address)');
      return new Customer(id, name, phone, dept, address);
    } catch (err) {
      throw err instanceof AppError ? err : new DatabaseException(err.message);
    }
  }

  async rename(id, newName) {
    if (!newName || newName.trim() === '') throw new ValidationException('ชื่อต้องไม่ว่าง');
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('CustomerID', sql.VarChar(20), id)
        .input('Name',       sql.NVarChar(100), newName)
        .query('UPDATE Customers SET Name = @Name WHERE CustomerID = @CustomerID');
      if (result.rowsAffected[0] === 0) throw new ResourceNotFoundException(`ลูกค้า id=${id}`);
    } catch (err) {
      throw err instanceof AppError ? err : new DatabaseException(err.message);
    }
  }

  async delete(id) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('CustomerID', sql.VarChar(20), id)
        .query('DELETE FROM Customers WHERE CustomerID = @CustomerID');
      if (result.rowsAffected[0] === 0) throw new ResourceNotFoundException(`ลูกค้า id=${id}`);
    } catch (err) {
      throw err instanceof AppError ? err : new DatabaseException(err.message);
    }
  }
}

class OutfitRepository {
  async findAll() {
    try {
      const pool = await getPool();
      const result = await pool.request().query('SELECT * FROM Outfits');
      return result.recordset.map(r =>
        new Outfit(r.OutfitID, r.CustomerID, r.Name, r.Status || 'รอดำเนินการ', {
          price:        r.Price?.toString() || '',
          deposit:      r.Deposit?.toString() || '',
          remaining:    r.Remaining?.toString() || '',
          orderDate:    r.OrderDate    ? r.OrderDate.toISOString().split('T')[0]    : '',
          deliveryDate: r.DeliveryDate ? r.DeliveryDate.toISOString().split('T')[0] : '',
          chest:        r.Chest?.toString() || '',
          waist:        r.Waist?.toString() || '',
          hips:         r.Hips?.toString() || '',
          shirtLength:  r.ShirtLength?.toString() || '',
        })
      );
    } catch (err) {
      throw err instanceof AppError ? err : new DatabaseException(err.message);
    }
  }

  async create(customerId, name) {
    if (!customerId || !name) throw new ValidationException('ต้องระบุลูกค้าและชื่อชุด');
    try {
      const id = 'o' + Date.now();
      const pool = await getPool();
      await pool.request()
        .input('OutfitID',   sql.VarChar(20), id)
        .input('CustomerID', sql.VarChar(20), customerId)
        .input('Name',       sql.NVarChar(100), name)
        .query('INSERT INTO Outfits (OutfitID, CustomerID, Name) VALUES (@OutfitID, @CustomerID, @Name)');
      return new Outfit(id, customerId, name);
    } catch (err) {
      throw err instanceof AppError ? err : new DatabaseException(err.message);
    }
  }

  async update(id, status, measurements) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('OutfitID',     sql.VarChar(20), id)
        .input('Status',       sql.NVarChar(20), status)
        .input('Price',        sql.Decimal(10, 2), measurements.price || 0)
        .input('Deposit',      sql.Decimal(10, 2), measurements.deposit || 0)
        .input('Remaining',    sql.Decimal(10, 2), measurements.remaining || 0)
        .input('OrderDate',    sql.Date, measurements.orderDate || null)
        .input('DeliveryDate', sql.Date, measurements.deliveryDate || null)
        .input('Chest',        sql.Decimal(5, 2), measurements.chest || null)
        .input('Waist',        sql.Decimal(5, 2), measurements.waist || null)
        .input('Hips',         sql.Decimal(5, 2), measurements.hips || null)
        .input('ShirtLength',  sql.Decimal(5, 2), measurements.shirtLength || null)
        .query(`UPDATE Outfits SET Status=@Status, Price=@Price, Deposit=@Deposit, Remaining=@Remaining,
                OrderDate=@OrderDate, DeliveryDate=@DeliveryDate, Chest=@Chest, Waist=@Waist,
                Hips=@Hips, ShirtLength=@ShirtLength WHERE OutfitID=@OutfitID`);
      if (result.rowsAffected[0] === 0) throw new ResourceNotFoundException(`ชุด id=${id}`);
    } catch (err) {
      throw err instanceof AppError ? err : new DatabaseException(err.message);
    }
  }

  async rename(id, newName) {
    if (!newName || newName.trim() === '') throw new ValidationException('ชื่อชุดต้องไม่ว่าง');
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('OutfitID', sql.VarChar(20), id)
        .input('NewName',  sql.NVarChar(100), newName)
        .query('UPDATE Outfits SET Name = @NewName WHERE OutfitID = @OutfitID');
      if (result.rowsAffected[0] === 0) throw new ResourceNotFoundException(`ชุด id=${id}`);
    } catch (err) {
      throw err instanceof AppError ? err : new DatabaseException(err.message);
    }
  }

  async delete(id) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('OutfitID', sql.VarChar(20), id)
        .query('DELETE FROM Outfits WHERE OutfitID = @OutfitID');
      if (result.rowsAffected[0] === 0) throw new ResourceNotFoundException(`ชุด id=${id}`);
    } catch (err) {
      throw err instanceof AppError ? err : new DatabaseException(err.message);
    }
  }
}

class PhotoRepository {
  async findAll() {
    try {
      const pool = await getPool();
      const result = await pool.request().query('SELECT * FROM Photos');
      return result.recordset.map(r =>
        new Photo(r.PhotoID, r.OutfitID, r.PhotoURL, r.Caption || '')
      );
    } catch (err) {
      throw err instanceof AppError ? err : new DatabaseException(err.message);
    }
  }

  async create(outfitId, url, caption) {
    if (!outfitId || !url) throw new ValidationException('ต้องระบุชุดและ URL รูปภาพ');
    try {
      const id = 'p' + Date.now();
      const pool = await getPool();
      await pool.request()
        .input('PhotoID',  sql.VarChar(20), id)
        .input('OutfitID', sql.VarChar(20), outfitId)
        .input('PhotoURL', sql.NVarChar(sql.MAX), url)
        .input('Caption',  sql.NVarChar(255), caption || '')
        .query('INSERT INTO Photos (PhotoID, OutfitID, PhotoURL, Caption) VALUES (@PhotoID, @OutfitID, @PhotoURL, @Caption)');
      return new Photo(id, outfitId, url, caption);
    } catch (err) {
      throw err instanceof AppError ? err : new DatabaseException(err.message);
    }
  }

  async updateCaption(id, caption) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('PhotoID', sql.VarChar(20), id)
        .input('Caption', sql.NVarChar(255), caption)
        .query('UPDATE Photos SET Caption = @Caption WHERE PhotoID = @PhotoID');
      if (result.rowsAffected[0] === 0) throw new ResourceNotFoundException(`รูปภาพ id=${id}`);
    } catch (err) {
      throw err instanceof AppError ? err : new DatabaseException(err.message);
    }
  }

  async delete(id) {
    try {
      const pool = await getPool();
      const result = await pool.request()
        .input('PhotoID', sql.VarChar(20), id)
        .query('DELETE FROM Photos WHERE PhotoID = @PhotoID');
      if (result.rowsAffected[0] === 0) throw new ResourceNotFoundException(`รูปภาพ id=${id}`);
    } catch (err) {
      throw err instanceof AppError ? err : new DatabaseException(err.message);
    }
  }
}

// ==========================================
// EXPRESS APP + ROUTES
// ==========================================

const app  = express();
const PORT = process.env.PORT || 5000;

const customerRepo = new CustomerRepository();
const outfitRepo   = new OutfitRepository();
const photoRepo    = new PhotoRepository();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ทดสอบเชื่อมต่อ DB
getPool()
  .then(() => console.log(`✅ เชื่อมต่อ SQL Server (${dbConfig.database}) สำเร็จ!`))
  .catch(err => console.error('❌ เชื่อมต่อฐานข้อมูลไม่ได้:', err.message));

app.get('/', (req, res) => res.send('ยินดีต้อนรับสู่ Clothy API!'));

// --- Customer Routes ---
app.get('/api/customers', async (req, res, next) => {
  try {
    const customers = await customerRepo.findAll();
    res.json(customers.map(c => ({
      CustomerID: c.getId(),   Name: c.getName(),
      Phone: c.getPhone(),     Department: c.getDepartment(),
      Address: c.getAddress(),
    })));
  } catch (err) { next(err); }
});

app.post('/api/customers', async (req, res, next) => {
  try {
    const { name, phone, dept, address } = req.body;
    const customer = await customerRepo.create(name, phone, dept, address);
    res.status(201).json({ message: 'เพิ่มลูกค้าสำเร็จ!', customerId: customer.getId() });
  } catch (err) { next(err); }
});

app.put('/api/customers/:id/rename', async (req, res, next) => {
  try {
    await customerRepo.rename(req.params.id, req.body.newName);
    res.json({ message: 'แก้ไขชื่อลูกค้าสำเร็จ!' });
  } catch (err) { next(err); }
});

app.delete('/api/customers/:id', async (req, res, next) => {
  try {
    await customerRepo.delete(req.params.id);
    res.json({ message: 'ลบลูกค้าสำเร็จ!' });
  } catch (err) { next(err); }
});

// --- Outfit Routes ---
app.get('/api/outfits', async (req, res, next) => {
  try {
    const outfits = await outfitRepo.findAll();
    res.json(outfits.map(o => ({
      OutfitID:   o.getId(),         CustomerID: o.getCustomerId(),
      Name:       o.getName(),       Status:     o.getStatus(),
      ...o.getMeasurements(),
    })));
  } catch (err) { next(err); }
});

app.post('/api/outfits', async (req, res, next) => {
  try {
    const { customerId, name } = req.body;
    const outfit = await outfitRepo.create(customerId, name);
    res.status(201).json({ message: 'เพิ่มชุดใหม่สำเร็จ!', outfitId: outfit.getId() });
  } catch (err) { next(err); }
});

app.put('/api/outfits/:id', async (req, res, next) => {
  try {
    const { status, ...measurements } = req.body;
    await outfitRepo.update(req.params.id, status, measurements);
    res.json({ message: 'อัปเดตข้อมูลชุดสำเร็จ!' });
  } catch (err) { next(err); }
});

app.put('/api/outfits/:id/rename', async (req, res, next) => {
  try {
    await outfitRepo.rename(req.params.id, req.body.newName);
    res.json({ message: 'เปลี่ยนชื่อชุดสำเร็จ!' });
  } catch (err) { next(err); }
});

app.delete('/api/outfits/:id', async (req, res, next) => {
  try {
    await outfitRepo.delete(req.params.id);
    res.json({ message: 'ลบชุดสำเร็จ!' });
  } catch (err) { next(err); }
});

// --- Photo Routes ---
app.get('/api/photos', async (req, res, next) => {
  try {
    const photos = await photoRepo.findAll();
    res.json(photos.map(p => ({
      PhotoID:  p.getId(),       OutfitID: p.getOutfitId(),
      PhotoURL: p.getUrl(),      Caption:  p.getCaption(),
    })));
  } catch (err) { next(err); }
});

app.post('/api/photos', async (req, res, next) => {
  try {
    const { outfitId, url, caption } = req.body;
    const photo = await photoRepo.create(outfitId, url, caption);
    res.status(201).json({ message: 'บันทึกรูปสำเร็จ!', photoId: photo.getId() });
  } catch (err) { next(err); }
});

app.put('/api/photos/:id/caption', async (req, res, next) => {
  try {
    await photoRepo.updateCaption(req.params.id, req.body.caption);
    res.json({ message: 'อัปเดตแคปชั่นสำเร็จ!' });
  } catch (err) { next(err); }
});

app.delete('/api/photos/:id', async (req, res, next) => {
  try {
    await photoRepo.delete(req.params.id);
    res.json({ message: 'ลบรูปสำเร็จ!' });
  } catch (err) { next(err); }
});

// ==========================================
// ERROR HANDLING MIDDLEWARE
// ==========================================

app.use((err, req, res, next) => {
  console.error(`❌ [${err.name}] ${err.message}`);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ error: err.name, message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Clothy Server รันที่ http://localhost:${PORT}`);
});
