import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function PageContainer() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
