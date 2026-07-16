import { Box, CircularProgress, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import type { ReactElement } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { AdminPage } from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import PlayerRoomPage from './pages/PlayerRoomPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import { RoomPage } from './pages/RoomPage';
import RoomsPage from './pages/RoomsPage';
import { fantasyTheme } from './theme/fantasyTheme';

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
    <ThemeProvider theme={fantasyTheme}>
      <AdminPage onOpenAdmin={() => navigate('/admin')} onOpenRoom={() => navigate('/room')} />
    </ThemeProvider>
  );
}

function RoomRoute() {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={fantasyTheme}>
      <RoomPage onOpenAdmin={() => navigate('/admin')} onOpenRoom={() => navigate('/room')} />
    </ThemeProvider>
  );
}

function AuthLoadingScreen() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { currentUser, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function GuestOnlyRoute({ children }: { children: ReactElement }) {
  const { currentUser, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  if (currentUser) {
    return <Navigate to="/rooms" replace />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />

      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/rooms" replace />} />

            <Route
              path="/rooms"
              element={
                <ProtectedRoute>
                  <RoomsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <GuestOnlyRoute>
                  <LoginPage />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestOnlyRoute>
                  <RegisterPage />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminRoute />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room"
              element={
                <ProtectedRoute>
                  <RoomRoute />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/:roomId"
              element={
                <ProtectedRoute>
                  <PlayerRoomPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/rooms" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;