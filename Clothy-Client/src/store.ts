import { create } from 'zustand';

export type OutfitStatus = 'รอดำเนินการ' | 'กำลังทำ' | 'เสร็จสิ้น';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  dept?: string;
  address?: string;
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
}

export interface Outfit {
  id: string;
  customerId: string;
  name: string;
  status: OutfitStatus;
  measurements: any;
  photos: Photo[];
}

interface TailorStore {
  customers: Customer[];
  outfits: Outfit[];
  
  fetchCustomers: () => Promise<void>;
  fetchOutfits: () => Promise<void>;
  
  addCustomer: (name: string, phone: string, dept: string, address: string) => Promise<boolean>;
  addOutfit: (customerId: string, name: string) => Promise<string>;
  deleteOutfit: (outfitId: string) => Promise<void>;
  renameOutfit: (outfitId: string, newName: string) => Promise<void>;
  updateMeasurements: (outfitId: string, data: any) => Promise<void>;
  updateOutfitStatus: (outfitId: string, status: OutfitStatus) => Promise<void>;
  addPhoto: (outfitId: string, url: string, caption: string) => Promise<void>;
  updatePhotoCaption: (outfitId: string, photoId: string, caption: string) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
  renameCustomer: (customerId: string, newName: string) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
}

export const useTailorStore = create<TailorStore>((set, get) => ({
  customers: [], 
  outfits: [],   

  fetchCustomers: async () => {
    try {
      const res = await fetch('http://localhost:5000/api/customers');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      console.log("🔍 Raw data from server:", data[0]);
      const formatted = data.map((c: any) => ({
        id: c.CustomerID, name: c.Name, phone: c.Phone, dept: c.Department, address: c.Address
      }));
      set({ customers: formatted });
    } catch (error) { console.error("❌ โหลดลูกค้าล้มเหลว:", error); }
  },

  fetchOutfits: async () => {
    try {
      const [outfitsRes, photosRes] = await Promise.all([
        fetch('http://localhost:5000/api/outfits'),
        fetch('http://localhost:5000/api/photos') 
      ]);
      
      if (!outfitsRes.ok || !photosRes.ok) throw new Error('Network response was not ok');
      
      const outfitsData = await outfitsRes.json();
      const photosData = await photosRes.json();

      const formatted = outfitsData.map((o: any) => {
        const outfitPhotos = photosData
          .filter((p: any) => p.OutfitID === o.OutfitID)
          .map((p: any) => ({ id: p.PhotoID, url: p.PhotoURL, caption: p.Caption || '' }));

        return {
          id: o.OutfitID, 
          customerId: o.CustomerID, 
          name: o.Name, 
          status: o.Status || 'รอดำเนินการ',
          measurements: {
            price: o.Price?.toString() || '',
            deposit: o.Deposit?.toString() || '',
            remaining: o.Remaining?.toString() || '',
            orderDate: o.OrderDate ? o.OrderDate.split('T')[0] : '',
            deliveryDate: o.DeliveryDate ? o.DeliveryDate.split('T')[0] : '',
            chest: o.Chest?.toString() || '',
            waist: o.Waist?.toString() || '',
            hips: o.Hips?.toString() || '',
            shirtLength: o.ShirtLength?.toString() || ''
          },
          photos: outfitPhotos 
        };
      });
      set({ outfits: formatted });
    } catch (error) { console.error("❌ โหลดชุดสั่งตัดล้มเหลว:", error); }
  },

  // แก้เป็น — คืนค่า true/false แทน alert
addCustomer: async (name, phone, dept, address) => {
  try {
    const res = await fetch('http://localhost:5000/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, dept, address })
    });
    if (res.ok) {
      await get().fetchCustomers(); // โหลดข้อมูลใหม่ก่อน
      return true;                  // แล้วค่อยบอกว่าสำเร็จ
    }
  } catch (error) { console.error("❌ เพิ่มลูกค้าล้มเหลว:", error); }
  return false;
},
renameCustomer: async (customerId, newName) => {
  try {
    const res = await fetch(`http://localhost:5000/api/customers/${customerId}/rename`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newName })
    });
    if (res.ok) await get().fetchCustomers();
  } catch (error) { console.error("❌ แก้ไขชื่อลูกค้าล้มเหลว:", error); }
},

deleteCustomer: async (customerId) => {
  try {
    const res = await fetch(`http://localhost:5000/api/customers/${customerId}`, { 
      method: 'DELETE' 
    });
    if (res.ok) await get().fetchCustomers();
  } catch (error) { console.error("❌ ลบลูกค้าล้มเหลว:", error); }
},

  addOutfit: async (customerId, name) => {
    try {
      const res = await fetch('http://localhost:5000/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, name })
      });
      if (res.ok) {
        const data = await res.json();
        await get().fetchOutfits(); 
        return data.outfitId; 
      }
    } catch (error) { console.error("❌ เพิ่มชุดล้มเหลว:", error); }
    return '';
  },

  deleteOutfit: async (outfitId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/outfits/${outfitId}`, { method: 'DELETE' });
      if (res.ok) await get().fetchOutfits();
    } catch (error) { console.error("❌ ลบชุดล้มเหลว:", error); }
  },

  renameOutfit: async (outfitId, newName) => {
    try {
      const res = await fetch(`http://localhost:5000/api/outfits/${outfitId}/rename`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName })
      });
      if (res.ok) await get().fetchOutfits();
    } catch (error) { console.error("❌ เปลี่ยนชื่อชุดล้มเหลว:", error); }
  },

  updateMeasurements: async (outfitId, data) => {
    set((state) => ({
      outfits: state.outfits.map(o => o.id === outfitId ? { ...o, measurements: data } : o)
    }));
    const outfit = get().outfits.find(o => o.id === outfitId);
    if (!outfit) return;

    try {
      await fetch(`http://localhost:5000/api/outfits/${outfitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: outfit.status, ...data })
      });
    } catch (error) { console.error("❌ อัปเดตสัดส่วนล้มเหลว:", error); }
  },

  updateOutfitStatus: async (outfitId, status) => {
    set((state) => ({
      outfits: state.outfits.map(o => o.id === outfitId ? { ...o, status } : o)
    }));
    const outfit = get().outfits.find(o => o.id === outfitId);
    if (!outfit) return;

    try {
      await fetch(`http://localhost:5000/api/outfits/${outfitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status, ...outfit.measurements })
      });
    } catch (error) { console.error("❌ อัปเดตสถานะล้มเหลว:", error); }
  },

  addPhoto: async (outfitId, url, caption) => {
    try {
      const res = await fetch('http://localhost:5000/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outfitId, url, caption })
      });
      if (res.ok) {
        const data = await res.json();
        // เอา ID จริงจาก Database ยัดใส่หน้าจอทันที รูปเด้งขึ้นมาเลย
        set((state) => ({
          outfits: state.outfits.map(o => 
            o.id === outfitId ? { ...o, photos: [...o.photos, { id: data.photoId, url, caption }] } : o
          )
        }));
      }
    } catch (error) { console.error("❌ เพิ่มรูปล้มเหลว:", error); }
  },

  updatePhotoCaption: async (outfitId, photoId, caption) => {
    set((state) => ({ outfits: state.outfits.map(o => o.id === outfitId ? { ...o, photos: o.photos.map(p => p.id === photoId ? { ...p, caption } : p) } : o) }));
    try {
      await fetch(`http://localhost:5000/api/photos/${photoId}/caption`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption })
      });
    } catch (error) { console.error("❌ อัปเดตแคปชั่นล้มเหลว:", error); }
  },

  deletePhoto: async (photoId) => {
    // ลบออกจากหน้าจอทันที (ไม่ต้องรอโหลดใหม่)
    set((state) => ({
      outfits: state.outfits.map(o => ({
        ...o,
        photos: o.photos.filter(p => p.id !== photoId)
      }))
    }));
    try {
      await fetch(`http://localhost:5000/api/photos/${photoId}`, { method: 'DELETE' });
    } catch (error) { console.error("❌ ลบรูปล้มเหลว:", error); }
  }
}));