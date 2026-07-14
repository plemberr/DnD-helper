import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { AdminPage } from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import PlayerRoomPage from './pages/PlayerRoomPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import { RoomPage } from './pages/RoomPage';
import RoomsPage from './pages/RoomsPage';

const appTheme = createTheme({
  palette: {
    primary: { main: '#2196f3' },
    background: { default: '#f4f7fb' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h4: { fontWeight: 800 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
});

function AdminRoute() {
  const navigate = useNavigate();

  return (
    <AdminPage
      onOpenAdmin={() => navigate('/admin')}
      onOpenRoom={() => navigate('/room')}
    />
  );
}

function RoomRoute() {
  const navigate = useNavigate();

  return (
    <RoomPage
      onOpenAdmin={() => navigate('/admin')}
      onOpenRoom={() => navigate('/room')}
    />
  );
}

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />

      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/rooms" replace />} />

            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/admin" element={<AdminRoute />} />
            <Route path="/room" element={<RoomRoute />} />
            <Route path="/room/:roomId" element={<PlayerRoomPage />} />

            <Route path="*" element={<Navigate to="/rooms" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;