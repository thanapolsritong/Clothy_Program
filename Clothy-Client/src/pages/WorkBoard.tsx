import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useTailorStore } from '../store';
import type { OutfitStatus } from '../store';

export default function WorkBoard() {
  const navigate = useNavigate();
  const { outfits, customers } = useTailorStore();

  const statuses: OutfitStatus[] = ['รอดำเนินการ', 'กำลังทำ', 'เสร็จสิ้น'];

  return (
    <div className="min-h-screen bg-[#F5F9FC] text-[#333] font-sans pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <header className="mb-8 border-b border-[#e5e5e0] pb-6">
          <button onClick={() => navigate('/')} className="flex items-center text-gray-500 hover:text-[#6BB5D6] transition-colors mb-4 text-sm font-medium">
            <ChevronLeft size={18} className="mr-1" /> กลับไปหน้าแรก
          </button>
          <h1 className="text-3xl font-light text-[#333333]">กระดานงาน (Work Board)</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statuses.map(status => {
            const filteredOutfits = outfits.filter(o => o.getStatus() === status);
            return (
              <div key={status} className="bg-gray-100/50 rounded-2xl p-4 border border-[#e5e5e0] h-fit min-h-[500px]">
                <h2 className="font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200 flex justify-between">
                  {status} <span className="bg-white px-2 py-0.5 rounded-full text-xs text-gray-500 shadow-sm">{filteredOutfits.length}</span>
                </h2>
                <div className="flex flex-col gap-3">
                  {filteredOutfits.map(outfit => {
                    const customer = customers.find(c => c.getId() === outfit.getCustomerId());
                    return (
                      <div
                        key={outfit.getId()}
                        onClick={() => navigate(`/customer/${outfit.getCustomerId()}/outfit/${outfit.getId()}`)}
                        className="bg-white p-4 rounded-xl shadow-sm border border-[#e5e5e0] hover:border-[#6BB5D6] hover:shadow-md transition-all cursor-pointer group"
                      >
                        <h3 className="font-semibold text-gray-800 group-hover:text-[#6BB5D6]">{outfit.getName()}</h3>
                        <p className="text-sm text-gray-500 mb-2">ลูกค้า: {customer?.getName()}</p>
                        {outfit.getMeasurements()?.deliveryDate && (
                          <p className="text-xs bg-gray-50 text-gray-600 inline-block px-2 py-1 rounded-md border border-gray-100">
                            📅 ส่ง: {new Date(outfit.getMeasurements().deliveryDate).toLocaleDateString('th-TH')}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {filteredOutfits.length === 0 && (
                    <div className="text-center text-sm text-gray-400 py-8 border-2 border-dashed border-gray-200 rounded-xl">ไม่มีงานในช่องนี้</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
