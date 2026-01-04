import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title" onClick={() => navigate('/dashboard')}>
          UPS Monitor System
        </h1>
        <div className="header-user">
          <span className="username">{user?.username}</span>
          <button onClick={handleLogout} className="logout-btn">
            Вийти
          </button>
        </div>
      </div>
    </header>
  );
}
