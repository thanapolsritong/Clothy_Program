import React, { useState } from 'react';
import { useTailorStore } from '../store';
import { UserPlus, Search, Scissors, Settings, Edit2, Trash2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { customers, outfits, addCustomer, renameCustomer, deleteCustomer } = useTailorStore();
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
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State สำหรับโหมดปรับแต่งลูกค้า
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addCustomer(formData.name, formData.phone, formData.dept, formData.address);
      setFormData({ name: '', phone: '', dept: '', address: '' });
      setSuccessMsg('🎉 บันทึกลูกค้าสำเร็จ!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setSuccessMsg('❌ เกิดข้อผิดพลาด กรุณาตรวจสอบว่า Server รันอยู่');
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
      {/* Header */}
      <header className="bg-white border-b border-[#e5e5e0] py-6 px-8 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#8F9779] p-2 rounded-xl text-white">
            <Scissors size={24} />
          </div>
          <h1 className="text-2xl font-semibold tracking-wide text-[#8F9779]">Clothy</h1>
        </div>

        <button
          type="button"
          onClick={() => navigate('/board')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors font-sans shadow-sm"
        >
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
              <label className="block text-sm font-medium text-gray-600 mb-1">
                ชื่อลูกค้า <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#f4f5f2] border border-transparent focus:border-[#8F9779] focus:bg-white rounded-xl outline-none transition-all"
                placeholder="เช่น คุณสมชาย"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                เบอร์โทรศัพท์ <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#f4f5f2] border border-transparent focus:border-[#8F9779] focus:bg-white rounded-xl outline-none transition-all"
                placeholder="08X-XXX-XXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">แผนก (เลือกใส่ได้)</label>
              <input
                type="text"
                title="แผนก"
                value={formData.dept}
                onChange={e => setFormData({ ...formData, dept: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#f4f5f2] border border-transparent focus:border-[#8F9779] focus:bg-white rounded-xl outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">สถานที่จัดส่ง (เลือกใส่ได้)</label>
              <textarea
                title="สถานที่จัดส่ง"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#f4f5f2] border border-transparent focus:border-[#8F9779] focus:bg-white rounded-xl outline-none transition-all resize-none"
                rows={2}
                placeholder="กรอกสถานที่จัดส่ง"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-[#8F9779] hover:bg-[#7a8264] disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors shadow-sm"
            >
              {isLoading ? 'กำลังบันทึก...' : '+ สร้างโปรไฟล์ลูกค้า'}
            </button>
            {successMsg && (
              <div className={`mt-3 text-center text-sm font-medium py-2 rounded-xl ${
                successMsg.includes('❌') ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'
              }`}>
                {successMsg}
              </div>
            )}
          </form>
        </section>

        {/* รายชื่อลูกค้า Icon (ขวา) */}
        <section className="lg:col-span-2">

          {/* แถบแจ้งเตือนงานด่วน */}
          {upcomingDeadlines.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-sm">
              <div className="text-red-500 mt-1">🚨</div>
              <div>
                <h3 className="font-bold text-red-700 text-sm">
                  งานด่วน! ต้องส่งภายใน 7 วัน ({upcomingDeadlines.length} ชุด)
                </h3>
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {upcomingDeadlines.map(o => {
                    const cust = customers.find(c => c.id === o.customerId);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => navigate(`/customer/${o.customerId}/outfit/${o.id}`)}
                        className="bg-white border border-red-100 text-xs px-3 py-1.5 rounded-lg text-red-600 font-medium whitespace-nowrap hover:bg-red-100 transition"
                      >
                        {o.name} ({cust?.name}) - {new Date(o.measurements.deliveryDate).toLocaleDateString('th-TH')}
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
              {/* ปุ่มโหมดปรับแต่ง */}
              <button
                type="button"
                onClick={() => { setIsEditMode(!isEditMode); setEditingId(null); }}
                aria-label={isEditMode ? 'เสร็จสิ้นการปรับแต่ง' : 'เข้าโหมดปรับแต่งลูกค้า'}
                title={isEditMode ? 'เสร็จสิ้นการปรับแต่ง' : 'ปรับแต่งลูกค้า'}
                className={`px-4 py-2 rounded-xl flex items-center text-sm font-medium transition-all ${
                  isEditMode
                    ? 'bg-[#8F9779] text-white shadow-md'
                    : 'bg-white border border-[#e5e5e0] text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Settings size={16} className={`mr-1 ${isEditMode ? 'animate-spin' : ''}`} />
                {isEditMode ? 'เสร็จสิ้น' : 'ปรับแต่ง'}
              </button>

              <div className="relative hidden sm:block">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, เบอร์โทร..."
                  className="pl-10 pr-4 py-2 rounded-xl border border-[#e5e5e0] outline-none focus:border-[#8F9779] text-sm w-52"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {customers.map(customer => (
              <div key={customer.id} className="relative">
                <button
                  type="button"
                  disabled={isEditMode}
                  onClick={() => navigate(`/customer/${customer.id}`)}
                  aria-label={`ดูข้อมูลลูกค้า ${customer.name}`}
                  title={customer.name}
                  className={`w-full flex flex-col items-center p-6 bg-white rounded-3xl border shadow-sm transition-all group ${
                    isEditMode
                      ? 'border-dashed border-gray-300 opacity-80 cursor-default'
                      : 'border-[#e5e5e0] hover:shadow-md hover:-translate-y-1'
                  }`}
                >
                  <div className="w-20 h-20 rounded-full bg-[#f4f5f2] flex items-center justify-center text-[#8F9779] text-2xl font-semibold mb-4 group-hover:bg-[#8F9779] group-hover:text-white transition-colors">
                    {customer.name?.charAt(0) ?? '?'}
                  </div>

                  {/* ถ้ากำลังแก้ชื่อ แสดง input แทน */}
                  {editingId === customer.id ? (
                    <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus
                        value={tempName}
                        onChange={e => setTempName(e.target.value)}
                        aria-label="แก้ไขชื่อลูกค้า"
                        title="แก้ไขชื่อลูกค้า"
                        placeholder="ชื่อลูกค้า"
                        className="border-b-2 border-[#8F9779] outline-none text-sm font-medium w-full bg-transparent text-center"
                      />
                      <button
                        type="button"
                        onClick={() => handleRename(customer.id)}
                        aria-label="ยืนยันการเปลี่ยนชื่อ"
                        title="ยืนยันการเปลี่ยนชื่อ"
                        className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        aria-label="ยกเลิกการแก้ไข"
                        title="ยกเลิกการแก้ไข"
                        className="text-red-400 hover:bg-red-50 p-1 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-medium text-gray-800 text-center line-clamp-1">{customer.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{customer.phone}</p>
                    </>
                  )}
                </button>

                {/* ปุ่มแก้ไข/ลบ (แสดงเฉพาะโหมดปรับแต่ง) */}
                {isEditMode && editingId !== customer.id && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => { setEditingId(customer.id); setTempName(customer.name); }}
                      aria-label="แก้ไขชื่อลูกค้า"
                      title="แก้ไขชื่อลูกค้า"
                      className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`ลบลูกค้า "${customer.name}" ออกจากระบบ?\nข้อมูลชุดทั้งหมดของลูกค้าคนนี้จะหายไปด้วย`)) {
                          deleteCustomer(customer.id);
                        }
                      }}
                      aria-label="ลบลูกค้า"
                      title="ลบลูกค้า"
                      className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}