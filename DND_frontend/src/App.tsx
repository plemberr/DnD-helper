import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AdminPage } from './pages/AdminPage';
import { RoomPage } from './pages/RoomPage';

function AdminRoute() {
  const navigate = useNavigate();

  return <AdminPage onOpenAdmin={() => navigate('/admin')} onOpenRoom={() => navigate('/room')} />;
}

function RoomRoute() {
  const navigate = useNavigate();

  return <RoomPage onOpenAdmin={() => navigate('/admin')} onOpenRoom={() => navigate('/room')} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/room" element={<RoomRoute />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
