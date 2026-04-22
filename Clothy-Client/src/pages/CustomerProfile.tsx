import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Shirt, Trash2, Edit2, Check, X, Settings } from 'lucide-react';
import { useTailorStore } from '../store';

export default function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // ดึงฟังก์ชันใหม่ๆ จาก store
  const { customers, outfits, addOutfit, deleteOutfit, renameOutfit } = useTailorStore();
  
  // State สำหรับโหมดปรับแต่ง
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const customer = customers.find((c) => c.id === id);
  const customerOutfits = outfits.filter((o) => o.customerId === id);

  // คำนวณสรุปยอดเงิน
  const totalAmount = customerOutfits.reduce((sum, o) => sum + (parseFloat(o.measurements?.price) || 0), 0);
  const totalPaid = customerOutfits.reduce((sum, o) => sum + (parseFloat(o.measurements?.deposit) || 0), 0);
  const totalDebt = customerOutfits.reduce((sum, o) => sum + (parseFloat(o.measurements?.remaining) || 0), 0);

  if (!customer) return <div className="p-10 text-center">ไม่พบข้อมูลลูกค้า</div>;

  // แก้ไข Bug การสร้างชุดด้วย async/await
  const handleAddOutfit = async () => {
    const name = window.prompt('กรุณาตั้งชื่อชุดใหม่ (เช่น ชุดข้าราชการ, ชุดสูท):');
    if (name && name.trim() !== '') {
      // ⚠️ ต้องมี await ตรงนี้นะครับ! เพื่อให้มันรอ Store โหลดข้อมูลเสร็จก่อน
      const newOutfitId = await addOutfit(customer.id, name); 
      
      // เมื่อโหลดเสร็จและได้ ID มาแล้ว ถึงจะสั่งเปลี่ยนหน้า
      if (newOutfitId) {
        navigate(`/customer/${customer.id}/outfit/${newOutfitId}`);
      }
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
    <div className="min-h-screen bg-[#F9F8F6] text-[#333] font-sans pb-20">
      <div className="max-w-4xl mx-auto px-6 py-10">
        
        {/* ส่วนหัวและปุ่มควบคุม */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-500 hover:text-[#8F9779] transition-colors text-sm font-medium"
          >
            <ChevronLeft size={18} className="mr-1" /> กลับไปหน้าแรก (Dashboard)
          </button>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                setIsEditMode(!isEditMode);
                setEditingId(null);
              }}
              className={`px-4 py-2 rounded-xl flex items-center text-sm font-medium transition-all ${
                isEditMode 
                ? 'bg-[#8F9779] text-white shadow-md' 
                : 'bg-white border border-[#e5e5e0] text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Settings size={18} className={`mr-1 ${isEditMode ? 'animate-spin' : ''}`} /> 
              {isEditMode ? 'เสร็จสิ้นการปรับแต่ง' : 'ปรับแต่งหน้าชุด'}
            </button>

            <button
              onClick={handleAddOutfit}
              className="bg-[#8F9779] hover:bg-[#7a8264] text-white px-5 py-2.5 rounded-xl flex items-center text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={18} className="mr-1" /> เพิ่มชุดใหม่
            </button>
          </div>
        </header>

        {/* ข้อมูลลูกค้า */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#e5e5e0] mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-light mb-1">{customer.name}</h1>
            <p className="text-gray-500">เบอร์โทร: {customer.phone}</p>
            {customer.dept && <p className="text-sm text-gray-400 mt-1">แผนก: {customer.dept}</p>}
          </div>
          <div className="w-16 h-16 rounded-full bg-[#f4f5f2] text-[#8F9779] flex items-center justify-center text-2xl font-bold">
            {customer.name.charAt(0)}
          </div>
        </div>

        {/* กล่องสรุปการเงิน */}
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

        {/* รายการชุดสั่งตัด */}
        <h2 className="text-2xl font-light mb-6">ชุดงานของลูกค้า</h2>

        {customerOutfits.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-dashed border-[#d1d1cc] text-center">
            <p className="text-gray-500">ยังไม่มีประวัติการสั่งตัด</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerOutfits.map((outfit) => (
              <div key={outfit.id} className="relative group">
                <button
                  disabled={isEditMode}
                  onClick={() => navigate(`/customer/${customer.id}/outfit/${outfit.id}`)}
                  className={`w-full bg-white p-6 rounded-2xl border transition-all text-left flex items-start gap-4 ${
                    isEditMode 
                    ? 'border-dashed border-gray-300 opacity-80' 
                    : 'border-[#e5e5e0] shadow-sm hover:shadow-md hover:border-[#8F9779]'
                  }`}
                >
                  <div className={`p-3 rounded-xl transition-colors ${
                    isEditMode ? 'bg-gray-100 text-gray-400' : 'bg-[#f4f5f2] text-[#8F9779]'
                  }`}>
                    <Shirt size={24} />
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                  {editingId === outfit.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input 
                          autoFocus
                          value={tempName} 
                          onChange={(e) => setTempName(e.target.value)}
                          className="border-b-2 border-[#8F9779] outline-none text-lg font-semibold w-full bg-transparent"
                          /* 1. เพิ่ม aria-label, title และ placeholder ให้ Input */
                          aria-label="แก้ไขชื่อชุด"
                          title="แก้ไขชื่อชุด"
                          placeholder="กรอกชื่อชุด..."
                        />
                        <button 
                          onClick={() => handleRename(outfit.id)} 
                          className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"
                          /* 2. เพิ่ม aria-label และ title ให้ปุ่ม Check */
                          aria-label="ยืนยันการเปลี่ยนชื่อ"
                          title="ยืนยันการเปลี่ยนชื่อ"
                        >
                          <Check size={20}/>
                        </button>
                        <button 
                          onClick={() => setEditingId(null)} 
                          className="text-red-400 hover:bg-red-50 p-1 rounded"
                          /* 3. เพิ่ม aria-label และ title ให้ปุ่ม X */
                          aria-label="ยกเลิกการแก้ไข"
                          title="ยกเลิกการแก้ไข"
                        >
                          <X size={20}/>
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-lg truncate">{outfit.name}</h3>
                        <p className="text-sm text-gray-500">สถานะ: {outfit.status}</p>
                        {!isEditMode && (
                          <span className="text-xs font-medium text-[#8F9779] mt-2 block">
                            จัดการสัดส่วนและรูปภาพ →
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </button>

                {/* ปุ่มลบและแก้ไข (แสดงเฉพาะโหมดปรับแต่ง) */}
                {isEditMode && editingId !== outfit.id && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                    <button 
                      onClick={() => { setEditingId(outfit.id); setTempName(outfit.name); }}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="เปลี่ยนชื่อชุด"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        if(window.confirm(`คุณแน่ใจหรือไม่ที่จะลบชุด "${outfit.name}"? ข้อมูลสัดส่วนทั้งหมดจะหายไป`)) {
                          deleteOutfit(outfit.id);
                        }
                      }}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="ลบชุด"
                    >
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