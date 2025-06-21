import { useState, useEffect } from 'react';
import { AbilityContext } from './contexts';
import defineAbilityFor from './utility/defineAbilityFor';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import LoadingSpinner from './components/LoadingSpinner';
import Unauthorized from './pages/Unauthorized';
import { fetchUserPermissions, flattenPermissions } from './api/permissions';

function App() {
  const [userPermissions, setUserPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 模擬從 API 載入權限
        // 可以傳入不同的 userId 來測試不同權限：'default', 'readonly', 'limited'
        const permissions = await fetchUserPermissions('default');
        const flattenedPermissions = flattenPermissions(permissions);
        
        setUserPermissions(flattenedPermissions);
      } catch (err) {
        console.error('Failed to load permissions:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, []);

  const handleRetry = () => {
    setError(null);
    setUserPermissions(null);
    setLoading(true);
    
    // 重新載入權限
    const loadPermissions = async () => {
      try {
        const permissions = await fetchUserPermissions('default');
        const flattenedPermissions = flattenPermissions(permissions);
        setUserPermissions(flattenedPermissions);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadPermissions();
  };

  // 載入中狀態
  if (loading) {
    return <LoadingSpinner />;
  }

  // 錯誤狀態
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <Unauthorized />
        <div style={{ marginTop: '2rem' }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            權限載入失敗：{error.message}
          </p>
          <button 
            onClick={handleRetry}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AbilityContext.Provider value={defineAbilityFor(userPermissions || [])}>
        <AppRoutes />
      </AbilityContext.Provider>
    </BrowserRouter>
  );
}

export default App;
