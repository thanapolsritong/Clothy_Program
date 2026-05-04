import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Shirt, Trash2, Edit2, Check, X, Settings } from 'lucide-react';
import { useTailorStore } from '../store';

export default function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, outfits, addOutfit, deleteOutfit, renameOutfit } = useTailorStore();

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [tempName, setTempName]     = useState('');

  const customer       = customers.find(c => c.getId() === id);
  const customerOutfits = outfits.filter(o => o.getCustomerId() === id);

  const totalAmount = customerOutfits.reduce((sum, o) => sum + (parseFloat(o.getMeasurements()?.price) || 0), 0);
  const totalPaid   = customerOutfits.reduce((sum, o) => sum + (parseFloat(o.getMeasurements()?.deposit) || 0), 0);
  const totalDebt   = customerOutfits.reduce((sum, o) => sum + (parseFloat(o.getMeasurements()?.remaining) || 0), 0);

  if (!customer) return <div className="p-10 text-center">ไม่พบข้อมูลลูกค้า</div>;

  const handleAddOutfit = async () => {
    const name = window.prompt('กรุณาตั้งชื่อชุดใหม่ (เช่น ชุดข้าราชการ, ชุดสูท):');
    if (name && name.trim() !== '') {
      const newOutfitId = await addOutfit(customer.getId(), name);
      if (newOutfitId) navigate(`/customer/${customer.getId()}/outfit/${newOutfitId}`);
    }
  };

  const handleRename = async (outfitId: string) => {
    if (tempName.trim() !== '') {
      await renameOutfit(outfitId, tempName);
      setEditingId(null);
      setTempName('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F9FC] text-[#333] font-sans pb-20">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <button onClick={() => navigate('/')}
            className="flex items-center text-gray-500 hover:text-[#6BB5D6] transition-colors text-sm font-medium">
            <ChevronLeft size={18} className="mr-1" /> กลับไปหน้าแรก (Dashboard)
          </button>
          <div className="flex gap-2">
            <button onClick={() => { setIsEditMode(!isEditMode); setEditingId(null); }}
              className={`px-4 py-2 rounded-xl flex items-center text-sm font-medium transition-all ${
                isEditMode ? 'bg-[#6BB5D6] text-white shadow-md' : 'bg-white border border-[#e5e5e0] text-gray-600 hover:bg-gray-50'}`}>
              <Settings size={18} className={`mr-1 ${isEditMode ? 'animate-spin' : ''}`} />
              {isEditMode ? 'เสร็จสิ้นการปรับแต่ง' : 'ปรับแต่งหน้าชุด'}
            </button>
            <button onClick={handleAddOutfit}
              className="bg-[#6BB5D6] hover:bg-[#5A9EC4] text-white px-5 py-2.5 rounded-xl flex items-center text-sm font-medium transition-colors shadow-sm">
              <Plus size={18} className="mr-1" /> เพิ่มชุดใหม่
            </button>
          </div>
        </header>

        {/* ข้อมูลลูกค้า */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#e5e5e0] mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-light mb-1">{customer.getName()}</h1>
            <p className="text-gray-500">เบอร์โทร: {customer.getPhone()}</p>
            {customer.getDept() && <p className="text-sm text-gray-400 mt-1">แผนก: {customer.getDept()}</p>}
          </div>
          <div className="w-16 h-16 rounded-full bg-[#EBF5FB] text-[#6BB5D6] flex items-center justify-center text-2xl font-bold">
            {customer.getName()?.charAt(0) ?? '?'}
          </div>
        </div>

        {/* สรุปการเงิน */}
        {customerOutfits.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl border border-[#e5e5e0] shadow-sm text-center">
              <p className="text-xs text-gray-500 font-semibold mb-1">ยอดสั่งตัดรวม</p>
              <p className="text-xl font-bold text-gray-800">฿{totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#e5e5e0] shadow-sm text-center">
              <p className="text-xs text-gray-500 font-semibold mb-1">มัดจำ/จ่ายแล้ว</p>
              <p className="text-xl font-bold text-emerald-600">฿{totalPaid.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-sm text-center bg-red-50">
              <p className="text-xs text-red-500 font-semibold mb-1">ค้างชำระรวม</p>
              <p className="text-xl font-bold text-red-600">฿{totalDebt.toLocaleString()}</p>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-light mb-6">ชุดงานของลูกค้า</h2>

        {customerOutfits.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-dashed border-[#d1d1cc] text-center">
            <p className="text-gray-500">ยังไม่มีประวัติการสั่งตัด</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerOutfits.map(outfit => (
              <div key={outfit.getId()} className="relative group">
                <button disabled={isEditMode}
                  onClick={() => navigate(`/customer/${customer.getId()}/outfit/${outfit.getId()}`)}
                  className={`w-full bg-white p-6 rounded-2xl border transition-all text-left flex items-start gap-4 ${
                    isEditMode ? 'border-dashed border-gray-300 opacity-80' : 'border-[#e5e5e0] shadow-sm hover:shadow-md hover:border-[#6BB5D6]'}`}>
                  <div className={`p-3 rounded-xl transition-colors ${isEditMode ? 'bg-gray-100 text-gray-400' : 'bg-[#EBF5FB] text-[#6BB5D6]'}`}>
                    <Shirt size={24} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {editingId === outfit.getId() ? (
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <input autoFocus value={tempName} onChange={e => setTempName(e.target.value)}
                          className="border-b-2 border-[#6BB5D6] outline-none text-lg font-semibold w-full bg-transparent"
                          aria-label="แก้ไขชื่อชุด" title="แก้ไขชื่อชุด" placeholder="กรอกชื่อชุด..." />
                        <button onClick={() => handleRename(outfit.getId())} aria-label="ยืนยัน" title="ยืนยัน"
                          className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"><Check size={20} /></button>
                        <button onClick={() => setEditingId(null)} aria-label="ยกเลิก" title="ยกเลิก"
                          className="text-red-400 hover:bg-red-50 p-1 rounded"><X size={20} /></button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-lg truncate">{outfit.getName()}</h3>
                        <p className="text-sm text-gray-500">สถานะ: {outfit.getStatus()}</p>
                        {!isEditMode && <span className="text-xs font-medium text-[#6BB5D6] mt-2 block">จัดการสัดส่วนและรูปภาพ →</span>}
                      </>
                    )}
                  </div>
                </button>

                {isEditMode && editingId !== outfit.getId() && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                    <button onClick={() => { setEditingId(outfit.getId()); setTempName(outfit.getName()); }}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="เปลี่ยนชื่อชุด">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => {
                        if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบชุด "${outfit.getName()}"? ข้อมูลสัดส่วนทั้งหมดจะหายไป`))
                          deleteOutfit(outfit.getId());
                      }}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="ลบชุด">
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
