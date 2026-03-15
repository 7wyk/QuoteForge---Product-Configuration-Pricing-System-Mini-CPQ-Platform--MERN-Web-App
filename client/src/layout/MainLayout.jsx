import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/configure': 'Product Configurator',
  '/quotes': 'Quote Management',
  '/admin/products': 'Product Management',
  '/admin/rules': 'Pricing Rules',
  '/admin/users': 'User Management',
};

export default function MainLayout() {
  const { pathname } = useLocation();
  const title = Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1] || 'QuoteForge';

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col">
        <Topbar title={title} />
        <main className="flex-1 overflow-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
