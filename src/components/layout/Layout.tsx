import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useTheme } from '../../contexts/ThemeContext';

const Layout = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      <div className="flex">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 max-w-screen-xl mx-auto">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Navigation - visible only on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-10">
        <MobileNav />
      </div>
    </div>
  );
};

export default Layout;