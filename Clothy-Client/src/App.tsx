import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useTailorStore } from './store'; // นำเข้า store
import Dashboard from './pages/Dashboard';
import OutfitDetail from './pages/OutfitDetail';
import CustomerProfile from './pages/CustomerProfile';
import WorkBoard from './pages/WorkBoard';

function App() {
  // 1. ดึงฟังก์ชันโหลดข้อมูลมาไว้ที่ไฟล์หลัก
  const { fetchCustomers, fetchOutfits } = useTailorStore();

  // 2. สั่งให้ดึงข้อมูลทันทีที่เปิดเว็บ (ไม่ว่าจะเข้าจากหน้าไหน ข้อมูลก็จะไม่หาย)
  useEffect(() => {
    fetchCustomers();
    fetchOutfits();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customer/:id" element={<CustomerProfile />} />
        <Route path="/customer/:id/outfit/:outfitId" element={<OutfitDetail />} />
        <Route path="/board" element={<WorkBoard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;