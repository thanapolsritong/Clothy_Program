const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, ShadingType, HeadingLevel,
  LevelFormat, PageBreak
} = require("docx");

const OUTPUT_PATH = path.join("D:\\Bu\\CE321\\FinalProject", "FinalProject_Report_CE323_Final.docx");

const FONT = "TH Sarabun New";
const SIZE = 32; // 16pt = 32 half-points
const SIZE_14 = 28; // 14pt = 28 half-points
const SIZE_28 = 56; // 28pt = 56 half-points
const SIZE_24 = 48; // 24pt = 48 half-points

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function makeHeading(text) {
  return new Paragraph({
    children: [new TextRun({ text: text, bold: true, font: FONT, size: SIZE })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 200, after: 100 },
  });
}

function makeBody(text, opts) {
  opts = opts || {};
  return new Paragraph({
    children: [new TextRun({
      text: text,
      font: FONT,
      size: SIZE,
      bold: opts.bold || false,
      italics: opts.italic || false,
      color: opts.color || undefined,
    })],
    alignment: AlignmentType.LEFT,
  });
}

function makeBullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text: text, font: FONT, size: SIZE })],
  });
}

function makeTechTable() {
  function makeHeaderCell(text) {
    return new TableCell({
      borders: cellBorders,
      width: { size: text === "ส่วน" ? 3000 : 6360, type: WidthType.DXA },
      margins: cellMargins,
      children: [new Paragraph({
        children: [new TextRun({ text: text, bold: true, font: FONT, size: SIZE })],
        alignment: AlignmentType.LEFT,
      })],
    });
  }
  function makeDataRow(col1, col2) {
    return new TableRow({
      children: [
        new TableCell({
          borders: cellBorders,
          width: { size: 3000, type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: col1, font: FONT, size: SIZE })] })],
        }),
        new TableCell({
          borders: cellBorders,
          width: { size: 6360, type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: col2, font: FONT, size: SIZE })] })],
        }),
      ],
    });
  }
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3000, 6360],
    rows: [
      new TableRow({
        children: [makeHeaderCell("ส่วน"), makeHeaderCell("เทคโนโลยี")],
      }),
      makeDataRow("Frontend", "React, TypeScript, Vite, Tailwind CSS"),
      makeDataRow("Backend", "Node.js, Express.js"),
      makeDataRow("Database", "Microsoft SQL Server (MSSQL)"),
      makeDataRow("ORM/Driver", "mssql (npm package)"),
    ],
  });
}

function makeDictTable(headers, rows) {
  const colWidths = [2000, 2000, 1200, 1800, 2360];
  function makeHeaderRow() {
    return new TableRow({
      children: headers.map(function(h, i) {
        return new TableCell({
          borders: cellBorders,
          width: { size: colWidths[i], type: WidthType.DXA },
          margins: cellMargins,
          shading: { fill: "D5E8F0", type: ShadingType.CLEAR },
          children: [new Paragraph({
            children: [new TextRun({ text: h, bold: true, font: FONT, size: SIZE })],
          })],
        });
      }),
    });
  }
  function makeDataRow2(rowData) {
    return new TableRow({
      children: rowData.map(function(cell, i) {
        return new TableCell({
          borders: cellBorders,
          width: { size: colWidths[i], type: WidthType.DXA },
          margins: cellMargins,
          children: [new Paragraph({
            children: [new TextRun({ text: cell, font: FONT, size: SIZE })],
          })],
        });
      }),
    });
  }
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [makeHeaderRow()].concat(rows.map(makeDataRow2)),
  });
}

function makeCodeBlock(lines) {
  var children = lines.map(function(line) {
    return new Paragraph({
      children: [new TextRun({ text: line, font: "Courier New", size: SIZE_14 })],
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 0 },
    });
  });
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            width: { size: 9360, type: WidthType.DXA },
            margins: { top: 100, bottom: 100, left: 160, right: 160 },
            shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
            children: children,
          }),
        ],
      }),
    ],
  });
}

function makeItalicNote(text) {
  return new Paragraph({
    children: [new TextRun({ text: text, font: FONT, size: SIZE, italics: true })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 60, after: 60 },
  });
}

// ---- Cover Page ----
var coverChildren = [
  new Paragraph({
    children: [new TextRun({ text: "รายงานโครงการ", bold: true, font: FONT, size: SIZE_28 })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 2000, after: 0 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "", font: FONT, size: SIZE })],
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [new TextRun({ text: "ระบบจัดการร้านตัดเสื้อ Clothy", bold: true, font: FONT, size: SIZE_24 })],
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [new TextRun({ text: "", font: FONT, size: SIZE })],
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [new TextRun({ text: "วิชา IT 440: Database Management Systems", font: FONT, size: SIZE })],
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [new TextRun({ text: "Section 228B", font: FONT, size: SIZE })],
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [new TextRun({ text: "", font: FONT, size: SIZE })],
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [new TextRun({ text: "อาจารย์ผู้สอน: อ.สุกิต คูชัยสิทธิ์ (A.Sukit Kuchaisit)", font: FONT, size: SIZE })],
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [new TextRun({ text: "", font: FONT, size: SIZE })],
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [new TextRun({ text: "จัดทำโดย", bold: true, font: FONT, size: SIZE })],
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [new TextRun({ text: "นายธนพล ศรีทอง    รหัสนักศึกษา 1650903550", font: FONT, size: SIZE })],
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [new TextRun({ text: "", font: FONT, size: SIZE })],
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [new TextRun({ text: "ภาคการศึกษาที่ 2/2568", font: FONT, size: SIZE })],
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [new TextRun({ text: "มหาวิทยาลัยกรุงเทพ (Bangkok University)", font: FONT, size: SIZE })],
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [new PageBreak()],
    alignment: AlignmentType.CENTER,
  }),
];

// ---- Section 1 ----
var sec1Children = [
  makeHeading("1. ภาพรวมของระบบงาน ข้อกำหนดและขอบเขตการดำเนินงานของระบบ"),
  makeBody("ระบบจัดการร้านตัดเสื้อ Clothy เป็นระบบสารสนเทศสำหรับร้านตัดเสื้อขนาดเล็กถึงขนาดกลาง ออกแบบมาเพื่อช่วยให้ช่างตัดเสื้อสามารถบริหารจัดการลูกค้า ชุดงาน สัดส่วนร่างกาย และรูปภาพประกอบได้อย่างมีประสิทธิภาพ ผ่านระบบเว็บแอพพลิเคชัน"),
  new Paragraph({
    children: [new TextRun({ text: "ขอบเขตการดำเนินงาน", bold: true, font: FONT, size: SIZE })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 120, after: 80 },
  }),
  makeBullet("จัดเก็บข้อมูลลูกค้า (ชื่อ เบอร์โทรศัพท์ แผนก)"),
  makeBullet("บันทึกชุดงานแต่ละชุดพร้อมสัดส่วนร่างกายทั้งหมด 24 จุด"),
  makeBullet("ติดตามสถานะงาน (รอดำเนินการ / กำลังทำ / เสร็จสิ้น)"),
  makeBullet("บันทึกข้อมูลทางการเงิน (ราคา มัดจำ ค้างชำระ)"),
  makeBullet("จัดการรูปภาพประกอบแต่ละชุด"),
  makeBullet("แสดงภาพรวมงานผ่าน Work Board (Kanban)"),
  new Paragraph({
    children: [new TextRun({ text: "เทคโนโลยีที่ใช้", bold: true, font: FONT, size: SIZE })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 120, after: 80 },
  }),
  makeTechTable(),
];

// ---- Section 2 ----
var sec2Children = [
  makeHeading("2. ER Diagram"),
  makeBody("แผนภาพ Entity-Relationship ของระบบ Clothy แสดงความสัมพันธ์ระหว่าง 3 Entity หลัก"),
  new Paragraph({
    children: [new TextRun({ text: "[แทรกรูป ER Diagram ที่นี่]", font: FONT, size: SIZE, italics: true, color: "999999" })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 120, after: 120 },
  }),
  new Paragraph({
    children: [new TextRun({ text: "ความสัมพันธ์ในระบบ", bold: true, font: FONT, size: SIZE })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 80, after: 80 },
  }),
  makeBody("Customers ↔ Outfits : หนึ่งลูกค้า (1) มีได้หลายชุด (N) — ความสัมพันธ์ One-to-Many"),
  makeBody("Outfits ↔ Photos : หนึ่งชุด (1) มีได้หลายรูปภาพ (N) — ความสัมพันธ์ One-to-Many"),
  makeBody("Relation Name: Customers–Outfits = \"Orders\", Outfits–Photos = \"Has\""),
];

// ---- Section 3 ----
var sec3Children = [
  makeHeading("3. ตาราง (Map Table จาก ER Diagram)"),
  new Paragraph({
    children: [new TextRun({ text: "หมายเหตุ: ขีดเส้นใต้ = Primary Key (PK), ตัวเอียง = Foreign Key (FK)", bold: true, font: FONT, size: SIZE })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 80, after: 80 },
  }),
  // Customers
  new Paragraph({
    children: [
      new TextRun({ text: "Customers(", font: FONT, size: SIZE }),
      new TextRun({ text: "CustomerID", font: FONT, size: SIZE, underline: {} }),
      new TextRun({ text: ", Name, Phone, Dept)", font: FONT, size: SIZE }),
    ],
    alignment: AlignmentType.LEFT,
    spacing: { before: 60, after: 60 },
  }),
  // Outfits
  new Paragraph({
    children: [
      new TextRun({ text: "Outfits(", font: FONT, size: SIZE }),
      new TextRun({ text: "OutfitID", font: FONT, size: SIZE, underline: {} }),
      new TextRun({ text: ", ", font: FONT, size: SIZE }),
      new TextRun({ text: "CustomerID", font: FONT, size: SIZE, italics: true }),
      new TextRun({ text: ", Name, Status, UnitPrice, Quantity, Price, Deposit, Remaining, OrderDate, DeliveryDate, FrontLength, BackLength, Shoulder, ChestWidth, WaistWidth, HipWidth, UpperArmWidth, ArmLength, SleeveWidth, WristWidth, NeckCircumference, WaistCircumference, HipCircumference, ThighWidth, KneeWidth, CalfWidth, AnkleWidth, TrouserLength, CrotchLength, RiseLength, LegOpening, Notes)", font: FONT, size: SIZE }),
    ],
    alignment: AlignmentType.LEFT,
    spacing: { before: 60, after: 60 },
  }),
  // Photos
  new Paragraph({
    children: [
      new TextRun({ text: "Photos(", font: FONT, size: SIZE }),
      new TextRun({ text: "PhotoID", font: FONT, size: SIZE, underline: {} }),
      new TextRun({ text: ", ", font: FONT, size: SIZE }),
      new TextRun({ text: "OutfitID", font: FONT, size: SIZE, italics: true }),
      new TextRun({ text: ", PhotoURL, Caption, UploadedAt)", font: FONT, size: SIZE }),
    ],
    alignment: AlignmentType.LEFT,
    spacing: { before: 60, after: 60 },
  }),
];

// ---- Section 4: Data Dictionary ----
var dictHeaders = ["Column", "Data Type", "Null", "Key", "คำอธิบาย"];

var customersRows = [
  ["CustomerID", "INT", "NOT NULL", "PK", "รหัสลูกค้า (Auto Increment)"],
  ["Name", "NVARCHAR(100)", "NOT NULL", "-", "ชื่อ-นามสกุลลูกค้า"],
  ["Phone", "NVARCHAR(20)", "NULL", "-", "เบอร์โทรศัพท์"],
  ["Dept", "NVARCHAR(100)", "NULL", "-", "แผนก/หน่วยงาน"],
];

var outfitsRows = [
  ["OutfitID", "INT", "NOT NULL", "PK", "รหัสชุด (Auto Increment)"],
  ["CustomerID", "INT", "NOT NULL", "FK → Customers", "รหัสลูกค้าที่สั่งตัด"],
  ["Name", "NVARCHAR(100)", "NOT NULL", "-", "ชื่อชุด"],
  ["Status", "NVARCHAR(50)", "NULL", "-", "สถานะงาน"],
  ["UnitPrice", "DECIMAL(10,2)", "NULL", "-", "ราคาต่อหน่วย"],
  ["Quantity", "INT", "NULL", "-", "จำนวน"],
  ["Price", "DECIMAL(10,2)", "NULL", "-", "ราคารวม"],
  ["Deposit", "DECIMAL(10,2)", "NULL", "-", "มัดจำ"],
  ["Remaining", "DECIMAL(10,2)", "NULL", "-", "ค้างชำระ"],
  ["OrderDate", "DATE", "NULL", "-", "วันที่สั่ง"],
  ["DeliveryDate", "DATE", "NULL", "-", "วันที่ส่งมอบ"],
  ["FrontLength", "DECIMAL(5,1)", "NULL", "-", "ความยาวหน้า (ซม.)"],
  ["BackLength", "DECIMAL(5,1)", "NULL", "-", "ความยาวหลัง (ซม.)"],
  ["Shoulder", "DECIMAL(5,1)", "NULL", "-", "ไหล่ (ซม.)"],
  ["ChestWidth", "DECIMAL(5,1)", "NULL", "-", "อก (ซม.)"],
  ["WaistWidth", "DECIMAL(5,1)", "NULL", "-", "เอว (ซม.)"],
  ["HipWidth", "DECIMAL(5,1)", "NULL", "-", "สะโพก (ซม.)"],
  ["UpperArmWidth", "DECIMAL(5,1)", "NULL", "-", "ต้นแขน (ซม.)"],
  ["ArmLength", "DECIMAL(5,1)", "NULL", "-", "ความยาวแขน (ซม.)"],
  ["SleeveWidth", "DECIMAL(5,1)", "NULL", "-", "ปลายแขน (ซม.)"],
  ["WristWidth", "DECIMAL(5,1)", "NULL", "-", "ข้อมือ (ซม.)"],
  ["NeckCircumference", "DECIMAL(5,1)", "NULL", "-", "รอบคอ (ซม.)"],
  ["WaistCircumference", "DECIMAL(5,1)", "NULL", "-", "รอบเอว (ซม.)"],
  ["HipCircumference", "DECIMAL(5,1)", "NULL", "-", "รอบสะโพก (ซม.)"],
  ["ThighWidth", "DECIMAL(5,1)", "NULL", "-", "ต้นขา (ซม.)"],
  ["KneeWidth", "DECIMAL(5,1)", "NULL", "-", "เข่า (ซม.)"],
  ["CalfWidth", "DECIMAL(5,1)", "NULL", "-", "น่อง (ซม.)"],
  ["AnkleWidth", "DECIMAL(5,1)", "NULL", "-", "ข้อเท้า (ซม.)"],
  ["TrouserLength", "DECIMAL(5,1)", "NULL", "-", "ความยาวกางเกง (ซม.)"],
  ["CrotchLength", "DECIMAL(5,1)", "NULL", "-", "เป้า (ซม.)"],
  ["RiseLength", "DECIMAL(5,1)", "NULL", "-", "ระยะยืน (ซม.)"],
  ["LegOpening", "DECIMAL(5,1)", "NULL", "-", "ปลายขา (ซม.)"],
  ["Notes", "NVARCHAR(MAX)", "NULL", "-", "หมายเหตุ"],
];

var photosRows = [
  ["PhotoID", "INT", "NOT NULL", "PK", "รหัสรูปภาพ (Auto Increment)"],
  ["OutfitID", "INT", "NOT NULL", "FK → Outfits", "รหัสชุดที่เกี่ยวข้อง"],
  ["PhotoURL", "NVARCHAR(500)", "NOT NULL", "-", "URL หรือ path ของรูปภาพ"],
  ["UploadedAt", "DATETIME", "NULL", "-", "วันเวลาที่อัปโหลด"],
];

var sec4Children = [
  makeHeading("4. พจนานุกรมข้อมูล (Data Dictionary)"),
  new Paragraph({
    children: [new TextRun({ text: "ตาราง: Customers", bold: true, font: FONT, size: SIZE })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 100, after: 80 },
  }),
  makeDictTable(dictHeaders, customersRows),
  new Paragraph({
    children: [new TextRun({ text: "ตาราง: Outfits", bold: true, font: FONT, size: SIZE })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 160, after: 80 },
  }),
  makeDictTable(dictHeaders, outfitsRows),
  new Paragraph({
    children: [new TextRun({ text: "ตาราง: Photos", bold: true, font: FONT, size: SIZE })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 160, after: 80 },
  }),
  makeDictTable(dictHeaders, photosRows),
];

// ---- Section 5: SQL Commands ----
var connectLines = [
  "const sql = require('mssql');",
  "",
  "const config = {",
  "  user: process.env.DB_USER,",
  "  password: process.env.DB_PASSWORD,",
  "  server: process.env.DB_SERVER,",
  "  database: process.env.DB_NAME,",
  "  options: {",
  "    encrypt: true,",
  "    trustServerCertificate: true",
  "  }",
  "};",
  "",
  "const pool = new sql.ConnectionPool(config);",
  "const poolConnect = pool.connect();",
  "",
  "poolConnect.then(() => {",
  "  console.log('Connected to SQL Server');",
  "}).catch(err => {",
  "  console.error('Connection failed:', err);",
  "});"
];

var selectLines = [
  "app.get('/api/customers', async (req, res) => {",
  "  try {",
  "    await poolConnect;",
  "    const result = await pool.request()",
  "      .query('SELECT * FROM Customers ORDER BY CustomerID');",
  "    res.json(result.recordset);",
  "  } catch (err) {",
  "    res.status(500).json({ error: err.message });",
  "  }",
  "});"
];

var insertLines = [
  "app.post('/api/customers', async (req, res) => {",
  "  const { name, phone, dept } = req.body;",
  "  try {",
  "    await poolConnect;",
  "    const result = await pool.request()",
  "      .input('name', sql.NVarChar, name)",
  "      .input('phone', sql.NVarChar, phone)",
  "      .input('dept', sql.NVarChar, dept)",
  "      .query(`INSERT INTO Customers (Name, Phone, Dept)",
  "              VALUES (@name, @phone, @dept);",
  "              SELECT SCOPE_IDENTITY() AS id`);",
  "    res.json({ id: result.recordset[0].id });",
  "  } catch (err) {",
  "    res.status(500).json({ error: err.message });",
  "  }",
  "});"
];

var updateLines = [
  "app.put('/api/outfits/:id/measurements', async (req, res) => {",
  "  const { id } = req.params;",
  "  const m = req.body;",
  "  try {",
  "    await poolConnect;",
  "    await pool.request()",
  "      .input('id', sql.Int, id)",
  "      .input('status', sql.NVarChar, m.status)",
  "      .input('unitPrice', sql.Decimal(10,2), m.unitPrice)",
  "      .input('price', sql.Decimal(10,2), m.price)",
  "      .input('deposit', sql.Decimal(10,2), m.deposit)",
  "      .input('remaining', sql.Decimal(10,2), m.remaining)",
  "      .input('deliveryDate', sql.Date, m.deliveryDate)",
  "      .query(`UPDATE Outfits SET",
  "                Status=@status, UnitPrice=@unitPrice,",
  "                Price=@price, Deposit=@deposit,",
  "                Remaining=@remaining, DeliveryDate=@deliveryDate",
  "              WHERE OutfitID=@id`);",
  "    res.json({ success: true });",
  "  } catch (err) {",
  "    res.status(500).json({ error: err.message });",
  "  }",
  "});"
];

var deleteLines = [
  "app.delete('/api/customers/:id', async (req, res) => {",
  "  const { id } = req.params;",
  "  try {",
  "    await poolConnect;",
  "    await pool.request()",
  "      .input('id', sql.Int, id)",
  "      .query('DELETE FROM Customers WHERE CustomerID = @id');",
  "    res.json({ success: true });",
  "  } catch (err) {",
  "    res.status(500).json({ error: err.message });",
  "  }",
  "});"
];

var sec5Children = [
  makeHeading("5. SQL Commands รายบุคคล"),
  new Paragraph({
    children: [new TextRun({ text: "คนที่ 1  เลขที่ -  นายธนพล ศรีทอง  รหัส 1650903550", bold: true, font: FONT, size: SIZE })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 80, after: 120 },
  }),
  // 1. Connect
  new Paragraph({
    children: [new TextRun({ text: "1. Connect", bold: true, font: FONT, size: SIZE })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 80, after: 60 },
  }),
  makeCodeBlock(connectLines),
  makeItalicNote("(อธิบายด้วยลายมือ)"),
  // 2. Select
  new Paragraph({
    children: [new TextRun({ text: "2. Select", bold: true, font: FONT, size: SIZE })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 120, after: 60 },
  }),
  makeCodeBlock(selectLines),
  makeItalicNote("(อธิบายด้วยลายมือ)"),
  // 3. Insert
  new Paragraph({
    children: [new TextRun({ text: "3. Insert", bold: true, font: FONT, size: SIZE })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 120, after: 60 },
  }),
  makeCodeBlock(insertLines),
  makeItalicNote("(อธิบายด้วยลายมือ)"),
  // 4. Update
  new Paragraph({
    children: [new TextRun({ text: "4. Update", bold: true, font: FONT, size: SIZE })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 120, after: 60 },
  }),
  makeCodeBlock(updateLines),
  makeItalicNote("(อธิบายด้วยลายมือ)"),
  // 5. Delete
  new Paragraph({
    children: [new TextRun({ text: "5. Delete", bold: true, font: FONT, size: SIZE })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 120, after: 60 },
  }),
  makeCodeBlock(deleteLines),
  makeItalicNote("(อธิบายด้วยลายมือ)"),
];

// ---- Assemble Document ----
var allContentChildren = []
  .concat(sec1Children)
  .concat(sec2Children)
  .concat(sec3Children)
  .concat(sec4Children)
  .concat(sec5Children);

var doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 },
              },
            },
          },
        ],
      },
    ],
  },
  styles: {
    default: {
      document: {
        run: { font: FONT, size: SIZE },
      },
    },
  },
  sections: [
    // Cover page section (no page numbers, separate)
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: coverChildren,
    },
    // Content pages section
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: allContentChildren,
    },
  ],
});

Packer.toBuffer(doc).then(function(buffer) {
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log("SUCCESS: File created at " + OUTPUT_PATH);
  var stats = fs.statSync(OUTPUT_PATH);
  console.log("File size: " + stats.size + " bytes");
}).catch(function(err) {
  console.error("ERROR:", err);
  process.exit(1);
});
