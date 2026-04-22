import React, { useState } from 'react';
import { useTailorStore } from '../store';
import { UserPlus, Search, Scissors } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  // ไม่ต้องใช้ fetchCustomers, fetchOutfits ในหน้านี้แล้ว เพราะ App.tsx จัดการให้แล้ว
  const { customers, outfits, addCustomer } = useTailorStore(); 
  const navigate = useNavigate();

  // ฟังก์ชันคำนวณงานที่ต้องส่งภายใน 7 วัน
  const upcomingDeadlines = outfits.filter(o => {
    if (o.status === 'เสร็จสิ้น' || !o.measurements?.deliveryDate) return false;
    const delivery = new Date(o.measurements.deliveryDate);
    const today = new Date();
    const diffDays = Math.ceil((delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  const [formData, setFormData] = useState({ name: '', phone: '', dept: '', address: '' });

  // ฟังก์ชันสร้างลูกค้า
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // ใส่ await เพื่อรอให้บันทึกเสร็จก่อน
    await addCustomer(formData.name, formData.phone, formData.dept, formData.address);
    // ล้างฟอร์มให้ว่าง
    setFormData({ name: '', phone: '', dept: '', address: '' });
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white border-b border-[#e5e5e0] py-6 px-8 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#8F9779] p-2 rounded-xl text-white">
            <Scissors size={24} />
          </div>
          <h1 className="text-2xl font-semibold tracking-wide text-[#8F9779]">Clothy</h1>
        </div>
        
        <button onClick={() => navigate('/board')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors font-sans shadow-sm">
          📊 กระดานงาน (Work Board)
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* ฟอร์มรับลูกค้าใหม่ (ซ้าย) */}
        <section className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-[#e5e5e0] h-fit">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <UserPlus size={20} className="text-[#8F9779]" /> ลงทะเบียนลูกค้าใหม่
          </h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">ชื่อลูกค้า <span className="text-red-400">*</span></label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-[#f4f5f2] border border-transparent focus:border-[#8F9779] focus:bg-white rounded-xl outline-none transition-all" placeholder="เช่น คุณสมชาย" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">เบอร์โทรศัพท์ <span className="text-red-400">*</span></label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-[#f4f5f2] border border-transparent focus:border-[#8F9779] focus:bg-white rounded-xl outline-none transition-all" placeholder="08X-XXX-XXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">แผนก (เลือกใส่ได้)</label>
              <input type="text" title="แผนก" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})} className="w-full px-4 py-2.5 bg-[#f4f5f2] border border-transparent focus:border-[#8F9779] focus:bg-white rounded-xl outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">สถานที่จัดส่ง (เลือกใส่ได้)</label>
              <textarea title="สถานที่จัดส่ง" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 bg-[#f4f5f2] border border-transparent focus:border-[#8F9779] focus:bg-white rounded-xl outline-none transition-all resize-none" rows={2} placeholder="กรอกสถานที่จัดส่ง" />
            </div>
            <button type="submit" className="w-full mt-4 bg-[#8F9779] hover:bg-[#7a8264] text-white py-3 rounded-xl font-medium transition-colors shadow-sm">
              + สร้างโปรไฟล์ลูกค้า
            </button>
          </form>
        </section>

        {/* รายชื่อลูกค้า Icon (ขวา) */}
        <section className="lg:col-span-2">
          
          {/* แถบแจ้งเตือนงานด่วน */}
          {upcomingDeadlines.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-sm">
              <div className="text-red-500 mt-1">🚨</div>
              <div>
                <h3 className="font-bold text-red-700 text-sm">งานด่วน! ต้องส่งภายใน 7 วัน ({upcomingDeadlines.length} ชุด)</h3>
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {upcomingDeadlines.map(o => {
                    const cust = customers.find(c => c.id === o.customerId);
                    return (
                      <button key={o.id} onClick={() => navigate(`/customer/${o.customerId}/outfit/${o.id}`)} className="bg-white border border-red-100 text-xs px-3 py-1.5 rounded-lg text-red-600 font-medium whitespace-nowrap hover:bg-red-100 transition">
                        {o.name} ({cust?.name}) - {new Date(o.measurements.deliveryDate).toLocaleDateString('th-TH')}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-light">รายชื่อลูกค้า</h2>
              <p className="text-sm text-gray-500 mt-1">กดที่รายชื่อเพื่อจัดการชุดและสัดส่วน</p>
            </div>
            <div className="relative hidden sm:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="ค้นหาชื่อ, เบอร์โทร..." className="pl-10 pr-4 py-2 rounded-xl border border-[#e5e5e0] outline-none focus:border-[#8F9779] text-sm w-64" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {customers.map(customer => (
              <button 
                key={customer.id} 
                onClick={() => navigate(`/customer/${customer.id}`)}
                className="flex flex-col items-center p-6 bg-white rounded-3xl border border-[#e5e5e0] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
              >
                <div className="w-20 h-20 rounded-full bg-[#f4f5f2] flex items-center justify-center text-[#8F9779] text-2xl font-semibold mb-4 group-hover:bg-[#8F9779] group-hover:text-white transition-colors">
                  {customer.name.charAt(0)}
                </div>
                <h3 className="font-medium text-gray-800 text-center line-clamp-1">{customer.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{customer.phone}</p>
              </button>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}