import { useEffect, useState } from 'react';
import { AdminPage } from './pages/AdminPage';
import { RoomPage } from './pages/RoomPage';

function App() {
  const [screen, setScreen] = useState<'admin' | 'room'>(() =>
    typeof window !== 'undefined' && window.location.hash === '#room' ? 'room' : 'admin',
  );

  useEffect(() => {
    const syncFromHash = () => {
      setScreen(typeof window !== 'undefined' && window.location.hash === '#room' ? 'room' : 'admin');
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);

    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const navigateToScreen = (nextScreen: 'admin' | 'room') => {
    setScreen(nextScreen);

    if (typeof window === 'undefined') {
      return;
    }

    window.location.hash = nextScreen === 'room' ? '#room' : '#admin';
  };

  if (screen === 'room') {
    return <RoomPage onOpenAdmin={() => navigateToScreen('admin')} onOpenRoom={() => navigateToScreen('room')} />;
  }

  return <AdminPage onOpenAdmin={() => navigateToScreen('admin')} onOpenRoom={() => navigateToScreen('room')} />;
}

export default App;
