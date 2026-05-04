import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, UploadCloud, Save, CheckCircle, ImagePlus, Calendar, CreditCard, Trash2, Edit2, X, Check } from 'lucide-react';
import { useTailorStore } from '../store';
import type { OutfitStatus } from '../store';

export default function OutfitDetail() {
  const { id: customerId, outfitId } = useParams<{ id: string; outfitId: string }>();
  const navigate = useNavigate();
  const { outfits, customers, updateMeasurements, updateOutfitStatus, addPhoto, updatePhotoCaption, deletePhoto } = useTailorStore();

  const customer = customers.find((c) => c.getId() === customerId);
  const outfit = outfits.find((o) => o.getId() === outfitId);

  // State สัดส่วนและการเงิน
  const [measurements, setMeasurements] = useState(
    outfit?.getMeasurements() || {
      frontLength: '', backLength: '', frontShoulder: '', backShoulder: '',
      shoulder: '', neck: '', chest: '', chestHeight: '', chestDistance: '',
      topWaist: '', topBelly: '', topHips: '', shirtLength: '',
      armpit: '', armWidth: '', armLength: '', wrist: '',
      bottomWaist: '', bottomBelly: '', bottomHips: '', skirtLength: '',
      crotchDepth: '', crotch: '', thigh: '', pantsLength: '', legOpening: '',
      orderDate: '', deliveryDate: '',
      unitPrice: '', quantity: '1', price: '', deposit: '', remaining: ''
    }
  );

  const [isSaved, setIsSaved] = useState(false);

  // State สำหรับระบบอัปโหลดรูปภาพ
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newCaption, setNewCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State สำหรับแก้ไขแคปชั่นรูปเก่า
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editCaptionText, setEditCaptionText] = useState('');

  const otherOutfits = outfits.filter(o => o.getCustomerId() === customerId && o.getId() !== outfitId);

  useEffect(() => {
    if (outfit) {
      setMeasurements(outfit.getMeasurements());
    }
  }, [outfit]);

  if (!customer || !outfit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F9FC]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">ไม่พบข้อมูลชุดที่เลือก</p>
          <button onClick={() => navigate('/')} className="text-[#6BB5D6] underline hover:text-[#5A9EC4]">กลับไปยังหน้าแรก</button>
        </div>
      </div>
    );
  }

  // ฟังก์ชันสัดส่วน & การเงิน
  const handleCopyMeasurements = (sourceOutfitId: string) => {
    const sourceOutfit = outfits.find(o => o.getId() === sourceOutfitId);
    if (sourceOutfit) {
      if (window.confirm(`ต้องการคัดลอกสัดส่วนจาก "${sourceOutfit.getName()}" ใช่หรือไม่?\n(ข้อมูลวันที่และราคาจะไม่ถูกคัดลอกมาด้วย)`)) {
        setMeasurements(prev => ({
          ...prev,
          ...sourceOutfit.getMeasurements(),
          orderDate: prev.orderDate, deliveryDate: prev.deliveryDate, price: prev.price, deposit: prev.deposit, remaining: prev.remaining
        }));
      }
    }
  };

  const handleFinancialChange = (field: 'unitPrice' | 'quantity' | 'deposit', value: string) => {
    const newData = { ...measurements, [field]: value };
    const unitPrice = parseFloat(newData.unitPrice) || 0;
    const quantity  = parseInt(newData.quantity)    || 1;
    const deposit   = parseFloat(newData.deposit)   || 0;
    const total     = unitPrice * quantity;
    newData.price     = total > 0 ? total.toString() : '';
    newData.remaining = total > 0 ? (total - deposit).toString() : '';
    setMeasurements(newData);
  };

  const handleSaveMeasurements = (e: React.FormEvent) => {
    e.preventDefault();
    updateMeasurements(outfit.getId(), measurements);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // -----------------------------------------------------
  // ฟังก์ชันระบบรูปภาพ (แปลงไฟล์เป็น Base64)
  // -----------------------------------------------------
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string); // แปลงเป็น Base64
      };
      reader.readAsDataURL(file);
    }
    // รีเซ็ตค่า input เผื่อผู้ใช้เลือกไฟล์เดิมซ้ำ
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveUpload = async () => {
    if (selectedImage) {
      await addPhoto(outfit.getId(), selectedImage, newCaption);
      setSelectedImage(null);
      setNewCaption('');
    }
  };

  const statusOptions: OutfitStatus[] = ['รอดำเนินการ', 'กำลังทำ', 'เสร็จสิ้น'];

  const renderInput = (key: keyof typeof measurements, label: string, suffix: string = 'นิ้ว') => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={measurements[key] || ''}
          onChange={(e) => setMeasurements({ ...measurements, [key]: e.target.value })}
          className="w-full px-3 py-2 bg-[#F5F9FC] border border-[#e5e5e0] focus:border-[#6BB5D6] focus:bg-white rounded-lg outline-none transition-all text-sm pr-8"
          placeholder={`กรอก ${label}`}
          title={label}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F9FC] text-[#333333] font-sans pb-20">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-[#e5e5e0] pb-6 gap-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-500 hover:text-[#6BB5D6] transition-colors mb-4 group text-sm font-medium"
            >
              <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
              กลับไป
            </button>
            <h1 className="text-3xl font-light text-[#333333] mb-2">{outfit.getName()}</h1>
            <p className="text-gray-500 text-sm">ลูกค้า: <span className="font-medium text-gray-700">{customer.getName()}</span></p>
          </div>

          <div className="flex gap-3 items-center print:hidden">
            <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
              🖨️ พิมพ์ใบงาน
            </button>
            <div className="bg-white p-2 rounded-xl shadow-sm border border-[#e5e5e0] flex">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => updateOutfitStatus(outfit.getId(), status)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-200 ${
                    outfit.getStatus() === status
                      ? status === 'เสร็จสิ้น' ? 'bg-emerald-100 text-emerald-800' : status === 'กำลังทำ' ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-800'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ส่วนที่ 1: รายละเอียดและสัดส่วน */}
        <div className="bg-[#6BB5D6] p-5 text-white flex justify-between items-center flex-wrap gap-4 rounded-t-2xl">
          <h2 className="text-lg font-medium tracking-wide flex items-center gap-2">รายละเอียดและสัดส่วน</h2>
          {otherOutfits.length > 0 && (
            <select
              title="คัดลอกสัดส่วนจากชุดอื่น"
              onChange={(e) => { if (e.target.value) { handleCopyMeasurements(e.target.value); e.target.value = ""; } }}
              className="text-sm text-gray-700 bg-white/90 border border-transparent rounded-lg px-3 py-1.5 outline-none hover:bg-white cursor-pointer shadow-sm"
            >
              <option value="">📋 คัดลอกสัดส่วนจากชุดอื่น...</option>
              {otherOutfits.map(o => <option key={o.getId()} value={o.getId()}>{o.getName()}</option>)}
            </select>
          )}
        </div>

        <div className="w-full bg-white rounded-b-2xl shadow-sm border border-[#e5e5e0] border-t-0 overflow-hidden mb-12">
          <form onSubmit={handleSaveMeasurements}>
            {/* ข้อมูลวันเวลาและราคา */}
            <div className="p-6 bg-[#EBF5FB] border-b border-[#e5e5e0] space-y-3">
              {/* Row 1: วันที่ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1"><Calendar size={12}/> วันที่รับงาน</label><input type="date" value={measurements.orderDate || ''} onChange={(e) => setMeasurements({ ...measurements, orderDate: e.target.value })} className="w-full px-3 py-2 rounded-md border border-[#d1d1cc] text-sm outline-none focus:border-[#6BB5D6]" title="วันที่รับงาน" /></div>
                <div><label className="text-xs font-semibold text-[#c85a5a] mb-1 flex items-center gap-1"><Calendar size={12}/> เวลาที่ต้องส่ง</label><input type="date" value={measurements.deliveryDate || ''} onChange={(e) => setMeasurements({ ...measurements, deliveryDate: e.target.value })} className="w-full px-3 py-2 rounded-md border border-[#c85a5a] text-sm outline-none focus:border-[#c85a5a]" title="เวลาที่ต้องส่ง" /></div>
              </div>
              {/* Row 2: ราคา */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1"><CreditCard size={12}/> ราคา/ชุด</label><input type="number" value={measurements.unitPrice || ''} onChange={(e) => handleFinancialChange('unitPrice', e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-md border border-[#d1d1cc] text-sm outline-none focus:border-[#6BB5D6]" /></div>
                <div><label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">จำนวนชุด</label><input type="number" min="1" value={measurements.quantity || '1'} onChange={(e) => handleFinancialChange('quantity', e.target.value)} placeholder="1" className="w-full px-3 py-2 rounded-md border border-[#d1d1cc] text-sm outline-none focus:border-[#6BB5D6]" /></div>
                <div><label className="text-xs font-semibold text-[#6BB5D6] mb-1 flex items-center gap-1">ราคารวม</label><input type="number" value={measurements.price || ''} readOnly placeholder="0" className="w-full px-3 py-2 rounded-md bg-blue-50 border border-[#6BB5D6] text-sm text-[#6BB5D6] font-semibold" /></div>
                <div><label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">มัดจำ</label><input type="number" value={measurements.deposit || ''} onChange={(e) => handleFinancialChange('deposit', e.target.value)} placeholder="0" className="w-full px-3 py-2 rounded-md border border-[#d1d1cc] text-sm outline-none focus:border-[#6BB5D6]" /></div>
              </div>
              {/* คงเหลือ */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-start-4"><label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">คงเหลือ</label><input type="number" value={measurements.remaining || ''} readOnly placeholder="0" className="w-full px-3 py-2 rounded-md bg-gray-100 border border-[#d1d1cc] text-sm text-gray-500 font-medium" /></div>
              </div>
            </div>

            {/* หมวดหมู่สัดส่วน */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div><h3 className="text-sm font-bold text-[#6BB5D6] border-b border-[#e5e5e0] pb-2 mb-4">ท่อนบน</h3><div className="grid grid-cols-2 gap-3">{renderInput('frontLength', 'ยาวหน้า')}{renderInput('backLength', 'ยาวหลัง')}{renderInput('frontShoulder', 'บ่าหน้า')}{renderInput('backShoulder', 'บ่าหลัง')}{renderInput('shoulder', 'ไหล่')}{renderInput('neck', 'คอ')}{renderInput('chest', 'รอบอก')}{renderInput('chestHeight', 'อกสูง')}{renderInput('chestDistance', 'อกห่าง')}{renderInput('topWaist', 'เอว (บน)')}{renderInput('topBelly', 'หน้าท้อง (บน)')}{renderInput('topHips', 'สะโพก (บน)')}<div className="col-span-2">{renderInput('shirtLength', 'เสื้อยาว')}</div></div></div>
              <div><h3 className="text-sm font-bold text-[#6BB5D6] border-b border-[#e5e5e0] pb-2 mb-4">ท่อนแขน</h3><div className="grid grid-cols-2 gap-3">{renderInput('armpit', 'รักแร้')}{renderInput('armWidth', 'แขนกว้าง')}{renderInput('armLength', 'แขนยาว')}{renderInput('wrist', 'ข้อมือ')}</div></div>
              <div><h3 className="text-sm font-bold text-[#6BB5D6] border-b border-[#e5e5e0] pb-2 mb-4">ท่อนล่าง (กางเกง/กระโปรง)</h3><div className="grid grid-cols-2 gap-3">{renderInput('bottomWaist', 'เอว (ล่าง)')}{renderInput('bottomBelly', 'หน้าท้อง (ล่าง)')}{renderInput('bottomHips', 'สะโพก (ล่าง)')}{renderInput('crotchDepth', 'เป้านั่ง')}{renderInput('crotch', 'รอบเป้า')}{renderInput('thigh', 'โคนขา')}{renderInput('legOpening', 'ปลายขา')}<div className="col-span-2">{renderInput('skirtLength', 'กระโปรงยาว')}</div><div className="col-span-2">{renderInput('pantsLength', 'กางเกงยาว')}</div></div></div>
            </div>

            <div className="p-6 border-t border-[#e5e5e0] bg-gray-50 flex justify-end">
              <button type="submit" className={`px-8 py-3 rounded-xl flex items-center justify-center font-medium transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none ${isSaved ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-[#6BB5D6] hover:bg-[#5A9EC4] text-white'}`}>
                {isSaved ? <><CheckCircle size={18} className="mr-2" /> บันทึกสำเร็จ</> : <><Save size={18} className="mr-2" /> บันทึกรายละเอียด</>}
              </button>
            </div>
          </form>
        </div>

        {/* ส่วนที่ 2: รูปภาพอ้างอิง */}
        <div className="w-full">
          <div className="flex justify-between items-end mb-6 border-b border-[#e5e5e0] pb-4">
            <div>
              <h2 className="text-2xl font-light">รูปภาพอ้างอิง & เนื้อผ้า</h2>
              <p className="text-gray-500 text-sm mt-1">อัปโหลดภาพแบบชุดหรือเนื้อผ้า พร้อมจดบันทึก</p>
            </div>

            {/* ซ่อน Input รับไฟล์ไว้ */}
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} title="Upload an image file" />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white hover:bg-gray-50 border border-[#e5e5e0] text-[#333333] px-5 py-2.5 rounded-xl flex items-center font-medium transition-all shadow-sm group"
            >
              <UploadCloud size={18} className="mr-2 text-gray-400 group-hover:text-[#6BB5D6]" />
              เพิ่มรูปภาพ
            </button>
          </div>

          {/* โซน Preview รูปภาพก่อนบันทึก */}
          {selectedImage && (
            <div className="mb-8 p-6 bg-white border border-[#e5e5e0] rounded-2xl shadow-sm flex flex-col sm:flex-row gap-6 items-start animate-fade-in">
              <img src={selectedImage} alt="Preview" className="w-40 h-40 object-cover rounded-xl border border-gray-200" />
              <div className="flex-1 w-full">
                <h3 className="text-lg font-medium mb-2">รูปภาพใหม่</h3>
                <textarea
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="เพิ่มคำอธิบายรูป (เช่น ทรงคอเสื้อ, ลายผ้า)"
                  className="w-full p-3 rounded-xl bg-[#F5F9FC] border border-[#e5e5e0] outline-none focus:border-[#6BB5D6] resize-none h-20 mb-3 text-sm"
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveUpload} className="bg-[#6BB5D6] hover:bg-[#5A9EC4] text-white px-5 py-2.5 rounded-xl flex items-center text-sm font-medium transition-colors">
                    <Save size={16} className="mr-2"/> บันทึกลงระบบ
                  </button>
                  <button onClick={() => { setSelectedImage(null); setNewCaption(''); }} className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* โซนแสดงรูปภาพทั้งหมด */}
          {outfit.getPhotos().length === 0 && !selectedImage ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#d1d1cc] p-16 text-center shadow-sm">
              <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
                <ImagePlus className="text-gray-300" size={32} />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">ยังไม่มีรูปภาพสำหรับชุดนี้</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">ถ่ายรูปจุดที่ต้องแก้ หรือผ้าที่ลูกค้าเลือกไว้เพื่อกันลืม</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#6BB5D6] hover:bg-[#5A9EC4] text-white px-8 py-3 rounded-xl inline-flex items-center font-medium transition-colors shadow-sm"
              >
                <Camera size={18} className="mr-2" /> เริ่มเพิ่มรูปภาพแรก
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {outfit.getPhotos().map((photo) => (
                <div key={photo.getId()} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#e5e5e0] flex flex-col group relative">

                  {/* ปุ่มลบรูปลอยอยู่มุมขวาบน (โชว์ตอนเอาเมาส์ชี้) */}
                  <button
                    onClick={() => { if(window.confirm('ต้องการลบรูปภาพนี้ใช่หรือไม่?')) deletePhoto(photo.getId()); }}
                    title="ลบรูปภาพ"
                    className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="aspect-square bg-gray-100 relative overflow-hidden border-b border-[#e5e5e0]">
                    <img src={photo.getUrl()} alt="รูปภาพอ้างอิง" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>

                  {/* โซนแคปชั่นและการแก้ไข */}
                  {editingPhotoId === photo.getId() ? (
                    <div className="p-4 bg-blue-50 flex items-center gap-2">
                      <input
                        autoFocus
                        value={editCaptionText}
                        onChange={(e) => setEditCaptionText(e.target.value)}
                        className="flex-1 px-3 py-2 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-400"
                        placeholder="พิมพ์คำอธิบาย..."
                      />
                      <button onClick={() => { updatePhotoCaption(outfit.getId(), photo.getId(), editCaptionText); setEditingPhotoId(null); }} className="text-emerald-600 bg-emerald-100 p-2 rounded-lg hover:bg-emerald-200" title="บันทึก"><Check size={18}/></button>
                      <button onClick={() => setEditingPhotoId(null)} className="text-gray-500 bg-gray-200 p-2 rounded-lg hover:bg-gray-300" title="ยกเลิก"><X size={18}/></button>
                    </div>
                  ) : (
                    <div className="p-4 bg-white flex justify-between items-start gap-3 min-h-[72px]">
                      <p className="text-sm text-gray-700 break-words flex-1 leading-relaxed">
                        {photo.getCaption() || <span className="text-gray-400 italic">ไม่มีคำอธิบาย</span>}
                      </p>
                      <button
                        onClick={() => { setEditingPhotoId(photo.getId()); setEditCaptionText(photo.getCaption()); }}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="แก้ไขคำอธิบาย"
                      >
                        <Edit2 size={16}/>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
