// 簡單的載入動畫元件
export default function LoadingSpinner() {
  const spinnerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column',
    gap: '1rem'
  };

  const dotStyle = {
    width: '12px',
    height: '12px',
    backgroundColor: '#3b82f6',
    borderRadius: '50%',
    display: 'inline-block',
    margin: '0 2px',
    animation: 'loading 1.4s infinite ease-in-out both'
  };

  return (
    <div style={spinnerStyle}>
      <div>
        <div style={{...dotStyle, animationDelay: '-0.32s'}}></div>
        <div style={{...dotStyle, animationDelay: '-0.16s'}}></div>
        <div style={dotStyle}></div>
      </div>
      <p style={{ color: '#6b7280', fontSize: '14px' }}>載入中...</p>
      
      <style>{`
        @keyframes loading {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}