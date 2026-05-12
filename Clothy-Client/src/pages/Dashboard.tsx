import React, { useState } from 'react';
import { useTailorStore } from '../store';
import { UserPlus, Search, Settings, Edit2, Trash2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClothyIcon from '../assets/Clothy-Icon.png';

export default function Dashboard() {
  const { customers, outfits, addCustomer, renameCustomer, deleteCustomer } = useTailorStore();
  const navigate = useNavigate();

  const [formData, setFormData]     = useState({ name: '', phone: '', department: '', address: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [tempName, setTempName]     = useState('');
  const [searchText, setSearchText] = useState('');

  // กรองลูกค้าตามคำค้นหา — ใช้ getter methods จาก Customer class
  const filteredCustomers = customers.filter(c =>
    c.getName().toLowerCase().includes(searchText.toLowerCase()) ||
    c.getPhone().includes(searchText)
  );

  // งานด่วนภายใน 7 วัน — ใช้ isDeadlineSoon() method จาก Outfit class
  const upcomingDeadlines = outfits.filter(o => o.isDeadlineSoon());

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const ok = await addCustomer(formData.name, formData.phone, formData.department, formData.address);
      if (ok) {
        setFormData({ name: '', phone: '', department: '', address: '' });
        setSuccessMsg('🎉 บันทึกลูกค้าสำเร็จ!');
      } else {
        setSuccessMsg('❌ เกิดข้อผิดพลาด กรุณาตรวจสอบว่า Server รันอยู่');
      }
      setTimeout(() => setSuccessMsg(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = async (customerId: string) => {
    if (tempName.trim() !== '') {
      await renameCustomer(customerId, tempName);
      setEditingId(null);
      setTempName('');
    }
  };

  return (
    <div>
      <header className="bg-white border-b border-[#e5e5e0] py-6 px-8 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={ClothyIcon} alt="Clothy" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
          <h1 className="text-2xl font-semibold tracking-wide text-[#6BB5D6]">Clothy</h1>
        </div>
        <button type="button" onClick={() => navigate('/board')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors font-sans shadow-sm">
          📊 กระดานงาน (Work Board)
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ฟอร์มรับลูกค้าใหม่ */}
        <section className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-[#e5e5e0] h-fit">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <UserPlus size={20} className="text-[#6BB5D6]" /> ลงทะเบียนลูกค้าใหม่
          </h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">ชื่อลูกค้า <span className="text-red-400">*</span></label>
              <input required type="text" value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#EBF5FB] border border-transparent focus:border-[#6BB5D6] focus:bg-white rounded-xl outline-none transition-all"
                placeholder="เช่น คุณสมชาย" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">เบอร์โทรศัพท์ <span className="text-red-400">*</span></label>
              <input required type="tel" value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#EBF5FB] border border-transparent focus:border-[#6BB5D6] focus:bg-white rounded-xl outline-none transition-all"
                placeholder="08X-XXX-XXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">แผนก (เลือกใส่ได้)</label>
              <input type="text" title="แผนก" value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#EBF5FB] border border-transparent focus:border-[#6BB5D6] focus:bg-white rounded-xl outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">สถานที่จัดส่ง (เลือกใส่ได้)</label>
              <textarea title="สถานที่จัดส่ง" value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#EBF5FB] border border-transparent focus:border-[#6BB5D6] focus:bg-white rounded-xl outline-none transition-all resize-none"
                rows={2} placeholder="กรอกสถานที่จัดส่ง" />
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full mt-4 bg-[#6BB5D6] hover:bg-[#5A9EC4] disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors shadow-sm">
              {isLoading ? 'กำลังบันทึก...' : '+ สร้างโปรไฟล์ลูกค้า'}
            </button>
            {successMsg && (
              <div className={`mt-3 text-center text-sm font-medium py-2 rounded-xl ${
                successMsg.includes('❌') ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>
                {successMsg}
              </div>
            )}
          </form>
        </section>

        {/* รายชื่อลูกค้า */}
        <section className="lg:col-span-2">

          {upcomingDeadlines.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-sm">
              <div className="text-red-500 mt-1">🚨</div>
              <div>
                <h3 className="font-bold text-red-700 text-sm">งานด่วน! ต้องส่งภายใน 7 วัน ({upcomingDeadlines.length} ชุด)</h3>
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {upcomingDeadlines.map(o => {
                    const cust = customers.find(c => c.getId() === o.getCustomerId());
                    return (
                      <button key={o.getId()} type="button"
                        onClick={() => navigate(`/customer/${o.getCustomerId()}/outfit/${o.getId()}`)}
                        className="bg-white border border-red-100 text-xs px-3 py-1.5 rounded-lg text-red-600 font-medium whitespace-nowrap hover:bg-red-100 transition">
                        {o.getName()} ({cust?.getName()}) — {new Date(o.getMeasurements().deliveryDate).toLocaleDateString('th-TH')}
                      </button>
                    );
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
            <div className="flex items-center gap-2">
              <button type="button"
                onClick={() => { setIsEditMode(!isEditMode); setEditingId(null); }}
                aria-label={isEditMode ? 'เสร็จสิ้น' : 'ปรับแต่งลูกค้า'}
                title={isEditMode ? 'เสร็จสิ้น' : 'ปรับแต่ง'}
                className={`px-4 py-2 rounded-xl flex items-center text-sm font-medium transition-all ${
                  isEditMode ? 'bg-[#6BB5D6] text-white shadow-md' : 'bg-white border border-[#e5e5e0] text-gray-600 hover:bg-gray-50'}`}>
                <Settings size={16} className={`mr-1 ${isEditMode ? 'animate-spin' : ''}`} />
                {isEditMode ? 'เสร็จสิ้น' : 'ปรับแต่ง'}
              </button>

              {/* Search — ใช้งานได้จริงแล้ว */}
              <div className="relative hidden sm:block">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="ค้นหาชื่อ, เบอร์โทร..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl border border-[#e5e5e0] outline-none focus:border-[#6BB5D6] text-sm w-52" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {filteredCustomers.map(customer => (
              <div key={customer.getId()} className="relative">
                <button type="button" disabled={isEditMode}
                  onClick={() => navigate(`/customer/${customer.getId()}`)}
                  aria-label={`ดูข้อมูลลูกค้า ${customer.getName()}`}
                  title={customer.getName()}
                  className={`w-full flex flex-col items-center p-6 bg-white rounded-3xl border shadow-sm transition-all group ${
                    isEditMode ? 'border-dashed border-gray-300 opacity-80 cursor-default' : 'border-[#e5e5e0] hover:shadow-md hover:-translate-y-1'}`}>
                  <div className="w-20 h-20 rounded-full bg-[#EBF5FB] flex items-center justify-center text-[#6BB5D6] text-2xl font-semibold mb-4 group-hover:bg-[#6BB5D6] group-hover:text-white transition-colors">
                    {customer.getName()?.charAt(0) ?? '?'}
                  </div>
                  {editingId === customer.getId() ? (
                    <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                      <input autoFocus value={tempName} onChange={e => setTempName(e.target.value)}
                        aria-label="แก้ไขชื่อลูกค้า" title="แก้ไขชื่อลูกค้า" placeholder="ชื่อลูกค้า"
                        className="border-b-2 border-[#6BB5D6] outline-none text-sm font-medium w-full bg-transparent text-center" />
                      <button type="button" onClick={() => handleRename(customer.getId())}
                        aria-label="ยืนยัน" title="ยืนยัน" className="text-emerald-600 hover:bg-emerald-50 p-1 rounded">
                        <Check size={16} />
                      </button>
                      <button type="button" onClick={() => setEditingId(null)}
                        aria-label="ยกเลิก" title="ยกเลิก" className="text-red-400 hover:bg-red-50 p-1 rounded">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-medium text-gray-800 text-center line-clamp-1">{customer.getName()}</h3>
                      <p className="text-xs text-gray-500 mt-1">{customer.getPhone()}</p>
                    </>
                  )}
                </button>

                {isEditMode && editingId !== customer.getId() && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button type="button"
                      onClick={() => { setEditingId(customer.getId()); setTempName(customer.getName()); }}
                      aria-label="แก้ไขชื่อ" title="แก้ไขชื่อ"
                      className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button type="button"
                      onClick={() => {
                        if (window.confirm(`ลบลูกค้า "${customer.getName()}" ออกจากระบบ?\nข้อมูลชุดทั้งหมดจะหายไปด้วย`))
                          deleteCustomer(customer.getId());
                      }}
                      aria-label="ลบลูกค้า" title="ลบลูกค้า"
                      className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {filteredCustomers.length === 0 && searchText && (
              <div className="col-span-full text-center text-gray-400 py-10">
                ไม่พบลูกค้าที่ค้นหา "{searchText}"
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
