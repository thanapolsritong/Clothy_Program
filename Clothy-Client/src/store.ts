import { create } from 'zustand';

export type OutfitStatus = 'รอดำเนินการ' | 'กำลังทำ' | 'เสร็จสิ้น';

// ==========================================
// MODEL CLASSES — Encapsulation + Inheritance (OOP)
// ==========================================

export abstract class BaseModel {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  getId(): string { return this.id; }

  abstract toString(): string;
}

export class Customer extends BaseModel {
  private name: string;
  private phone: string;
  private department: string;
  private address: string;

  constructor(id: string, name: string, phone: string, department = '', address = '') {
    super(id);
    this.name       = name;
    this.phone      = phone;
    this.department = department;
    this.address    = address;
  }

  getName():       string { return this.name; }
  getPhone():      string { return this.phone; }
  getDepartment(): string { return this.department; }
  getAddress(): string { return this.address; }

  setName(name: string): void {
    if (!name || name.trim() === '') throw new Error('ชื่อลูกค้าต้องไม่ว่าง');
    this.name = name;
  }

  toString(): string { return `[Customer] ${this.name} (${this.phone})`; }

  display(): string { return `${this.name} — ${this.phone}`; }
}

export class Photo extends BaseModel {
  private outfitId: string;
  private url: string;
  private caption: string;

  constructor(id: string, outfitId: string, url: string, caption = '') {
    super(id);
    this.outfitId = outfitId;
    this.url      = url;
    this.caption  = caption;
  }

  getOutfitId(): string { return this.outfitId; }
  getUrl():      string { return this.url; }
  getCaption():  string { return this.caption; }

  setCaption(caption: string): void { this.caption = caption; }

  toString(): string { return `[Photo] outfit=${this.outfitId} "${this.caption}"`; }
}

export class Outfit extends BaseModel {
  private customerId: string;
  private name: string;
  private status: OutfitStatus;
  private measurements: Record<string, string>;
  private photos: Photo[];

  constructor(
    id: string,
    customerId: string,
    name: string,
    status: OutfitStatus = 'รอดำเนินการ',
    measurements: Record<string, string> = {},
    photos: Photo[] = []
  ) {
    super(id);
    this.customerId   = customerId;
    this.name         = name;
    this.status       = status;
    this.measurements = measurements;
    this.photos       = photos;
  }

  getCustomerId():   string                 { return this.customerId; }
  getName():         string                 { return this.name; }
  getStatus():       OutfitStatus           { return this.status; }
  getMeasurements(): Record<string, string> { return this.measurements; }
  getPhotos():       Photo[]                { return this.photos; }

  setName(name: string): void {
    if (!name || name.trim() === '') throw new Error('ชื่อชุดต้องไม่ว่าง');
    this.name = name;
  }

  setStatus(status: OutfitStatus): void              { this.status = status; }
  setMeasurements(m: Record<string, string>): void   { this.measurements = m; }
  setPhotos(photos: Photo[]): void                   { this.photos = photos; }

  addPhoto(photo: Photo): void { this.photos.push(photo); }

  removePhoto(photoId: string): void {
    this.photos = this.photos.filter(p => p.getId() !== photoId);
  }

  isDeadlineSoon(): boolean {
    const delivery = this.measurements?.deliveryDate;
    if (this.status === 'เสร็จสิ้น' || !delivery) return false;
    const diffDays = Math.ceil(
      (new Date(delivery).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays >= 0 && diffDays <= 7;
  }

  toString(): string { return `[Outfit] ${this.name} — ${this.status}`; }
}

// ==========================================
// STORE (Zustand)
// ==========================================

interface TailorStore {
  customers: Customer[];
  outfits:   Outfit[];

  fetchCustomers:     () => Promise<void>;
  fetchOutfits:       () => Promise<void>;

  addCustomer:        (name: string, phone: string, department: string, address: string) => Promise<boolean>;
  renameCustomer:     (customerId: string, newName: string) => Promise<void>;
  deleteCustomer:     (customerId: string) => Promise<void>;

  addOutfit:          (customerId: string, name: string) => Promise<string>;
  deleteOutfit:       (outfitId: string) => Promise<void>;
  renameOutfit:       (outfitId: string, newName: string) => Promise<void>;
  updateMeasurements: (outfitId: string, data: Record<string, string>) => Promise<void>;
  updateOutfitStatus: (outfitId: string, status: OutfitStatus) => Promise<void>;

  addPhoto:           (outfitId: string, url: string, caption: string) => Promise<void>;
  updatePhotoCaption: (outfitId: string, photoId: string, caption: string) => Promise<void>;
  deletePhoto:        (photoId: string) => Promise<void>;
}

export const useTailorStore = create<TailorStore>((set, get) => ({
  customers: [],
  outfits:   [],

  fetchCustomers: async () => {
    try {
      const res = await fetch('/api/customers');
      if (!res.ok) throw new Error('โหลดลูกค้าล้มเหลว');
      const data = await res.json();
      const customers = data.map((c: any) =>
        new Customer(c.CustomerID, c.Name, c.Phone, c.Department ?? '', c.Address ?? '')
      );
      set({ customers });
    } catch (error) { console.error('❌ โหลดลูกค้าล้มเหลว:', error); }
  },

  fetchOutfits: async () => {
    try {
      const [outfitsRes, photosRes] = await Promise.all([
        fetch('/api/outfits'),
        fetch('/api/photos'),
      ]);
      if (!outfitsRes.ok || !photosRes.ok) throw new Error('โหลดข้อมูลล้มเหลว');

      const outfitsData = await outfitsRes.json();
      const photosData  = await photosRes.json();

      const outfits = outfitsData.map((o: any) => {
        const photos = photosData
          .filter((p: any) => p.OutfitID === o.OutfitID)
          .map((p: any) => new Photo(p.PhotoID, p.OutfitID, p.PhotoURL, p.Caption ?? ''));

        return new Outfit(
          o.OutfitID,
          o.CustomerID,
          o.Name,
          o.Status ?? 'รอดำเนินการ',
          {
            unitPrice:     o.unitPrice?.toString()     ?? '',
            quantity:      o.quantity?.toString()      ?? '1',
            price:         o.price?.toString()         ?? '',
            deposit:       o.deposit?.toString()       ?? '',
            remaining:     o.remaining?.toString()     ?? '',
            orderDate:     o.orderDate                 ?? '',
            deliveryDate:  o.deliveryDate              ?? '',
            // ท่อนบน
            frontLength:   o.frontLength?.toString()   ?? '',
            backLength:    o.backLength?.toString()    ?? '',
            frontShoulder: o.frontShoulder?.toString() ?? '',
            backShoulder:  o.backShoulder?.toString()  ?? '',
            shoulder:      o.shoulder?.toString()      ?? '',
            neck:          o.neck?.toString()          ?? '',
            chest:         o.chest?.toString()         ?? '',
            chestHeight:   o.chestHeight?.toString()   ?? '',
            chestDistance: o.chestDistance?.toString() ?? '',
            topWaist:      o.topWaist?.toString()      ?? '',
            topBelly:      o.topBelly?.toString()      ?? '',
            topHips:       o.topHips?.toString()       ?? '',
            shirtLength:   o.shirtLength?.toString()   ?? '',
            // ท่อนแขน
            armpit:        o.armpit?.toString()        ?? '',
            armWidth:      o.armWidth?.toString()      ?? '',
            armLength:     o.armLength?.toString()     ?? '',
            wrist:         o.wrist?.toString()         ?? '',
            // ท่อนล่าง
            bottomWaist:   o.bottomWaist?.toString()   ?? '',
            bottomBelly:   o.bottomBelly?.toString()   ?? '',
            bottomHips:    o.bottomHips?.toString()    ?? '',
            skirtLength:   o.skirtLength?.toString()   ?? '',
            crotchDepth:   o.crotchDepth?.toString()   ?? '',
            crotch:        o.crotch?.toString()        ?? '',
            thigh:         o.thigh?.toString()         ?? '',
            pantsLength:   o.pantsLength?.toString()   ?? '',
            legOpening:    o.legOpening?.toString()    ?? '',
          },
          photos
        );
      });
      set({ outfits });
    } catch (error) { console.error('❌ โหลดชุดสั่งตัดล้มเหลว:', error); }
  },

  //Insert — เพิ่มข้อมูลใหม่
  addCustomer: async (name, phone, department, address) => {
    // ฟังก์ชัน async รับชื่อ เบอร์ แผนก ที่อยู่ จากฟอร์มในเว็บ
    try {
      const res = await fetch('/api/customers', {
        // ส่ง HTTP request ไปหา server ที่ path /api/customers
        method: 'POST',
        // POST = บอก server ว่าจะเพิ่มข้อมูลใหม่
        headers: { 'Content-Type': 'application/json' },
        // บอก server ว่าข้อมูลที่ส่งไปเป็นรูปแบบ JSON
        body: JSON.stringify({ name, phone, dept: department, address }),
        // แปลง Object เป็น JSON string แล้วใส่ใน body ของ request
      });
      if (res.ok) { await get().fetchCustomers(); return true; }
      // ถ้า server ตอบกลับ OK → โหลดข้อมูลลูกค้าใหม่ให้หน้าเว็บอัปเดต
      // return true บอกให้ผู้เรียกรู้ว่าเพิ่มสำเร็จ
    } catch (error) { console.error('❌ เพิ่มลูกค้าล้มเหลว:', error); }
    // ถ้าเกิด error เช่น server ไม่ตอบให้แสดงใน console
    return false;
  },
//Update — แก้ไขข้อมูล
  renameCustomer: async (customerId, newName) => { 
    try {
      const res = await fetch(`/api/customers/${customerId}/rename`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName }),
      });
      if (res.ok) await get().fetchCustomers();
    } catch (error) { console.error('❌ แก้ไขชื่อลูกค้าล้มเหลว:', error); }
  },

  //Delete — ลบข้อมูล
  deleteCustomer: async (customerId) => {
    try {
      const res = await fetch(`/api/customers/${customerId}`, { method: 'DELETE' });
      if (res.ok) await get().fetchCustomers();
    } catch (error) { console.error('❌ ลบลูกค้าล้มเหลว:', error); }
  },

  addOutfit: async (customerId, name) => {
    try {
      const res = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, name }),
      });
      if (res.ok) {
        const data = await res.json();
        await get().fetchOutfits();
        return data.outfitId;
      }
    } catch (error) { console.error('❌ เพิ่มชุดล้มเหลว:', error); }
    return '';
  },

  deleteOutfit: async (outfitId) => {
    try {
      const res = await fetch(`/api/outfits/${outfitId}`, { method: 'DELETE' });
      if (res.ok) await get().fetchOutfits();
    } catch (error) { console.error('❌ ลบชุดล้มเหลว:', error); }
  },

  renameOutfit: async (outfitId, newName) => {
    try {
      const res = await fetch(`/api/outfits/${outfitId}/rename`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName }),
      });
      if (res.ok) await get().fetchOutfits();
    } catch (error) { console.error('❌ เปลี่ยนชื่อชุดล้มเหลว:', error); }
  },

  updateMeasurements: async (outfitId, data) => {
    set(state => ({
      outfits: state.outfits.map(o => {
        if (o.getId() !== outfitId) return o;
        o.setMeasurements(data);
        return o;
      }),
    }));
    const outfit = get().outfits.find(o => o.getId() === outfitId);
    if (!outfit) return;
    try {
      await fetch(`/api/outfits/${outfitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: outfit.getStatus(), ...data }),
      });
    } catch (error) { console.error('❌ อัปเดตสัดส่วนล้มเหลว:', error); }
  },

  updateOutfitStatus: async (outfitId, status) => {
    set(state => ({
      outfits: state.outfits.map(o => {
        if (o.getId() !== outfitId) return o;
        o.setStatus(status);
        return o;
      }),
    }));
    const outfit = get().outfits.find(o => o.getId() === outfitId);
    if (!outfit) return;
    try {
      await fetch(`/api/outfits/${outfitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...outfit.getMeasurements() }),
      });
    } catch (error) { console.error('❌ อัปเดตสถานะล้มเหลว:', error); }
  },

  addPhoto: async (outfitId, url, caption) => {
    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outfitId, url, caption }),
      });
      if (res.ok) {
        const data = await res.json();
        const newPhoto = new Photo(data.photoId, outfitId, url, caption);
        set(state => ({
          outfits: state.outfits.map(o => {
            if (o.getId() !== outfitId) return o;
            o.addPhoto(newPhoto);
            return o;
          }),
        }));
      }
    } catch (error) { console.error('❌ เพิ่มรูปล้มเหลว:', error); }
  },

  updatePhotoCaption: async (outfitId, photoId, caption) => {
    set(state => ({
      outfits: state.outfits.map(o => {
        if (o.getId() !== outfitId) return o;
        o.getPhotos().find(p => p.getId() === photoId)?.setCaption(caption);
        return o;
      }),
    }));
    try {
      await fetch(`/api/photos/${photoId}/caption`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption }),
      });
    } catch (error) { console.error('❌ อัปเดตแคปชั่นล้มเหลว:', error); }
  },

  deletePhoto: async (photoId) => {
    set(state => ({
      outfits: state.outfits.map(o => { o.removePhoto(photoId); return o; }),
    }));
    try {
      await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
    } catch (error) { console.error('❌ ลบรูปล้มเหลว:', error); }
  },
}));
