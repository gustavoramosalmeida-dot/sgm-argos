import { Link, useLocation } from 'react-router-dom';

export function Sidebar() {
  const location = useLocation();

  const isActive = (to: string) =>
    to === '/visao-sgm'
      ? location.pathname === '/visao-sgm'
      : location.pathname === to || location.pathname.startsWith(`${to}/`);

  const linkClass = (to: string) =>
    `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive(to) ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <aside className="w-56 bg-slate-50 border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col">
      <nav className="space-y-1">
        <Link to="/fabrica" className={linkClass('/fabrica')}>
          Visão da Fábrica
        </Link>
        <Link to="/plants" className={linkClass('/plants')}>
          Plantas
        </Link>
        <Link to="/maquinas" className={linkClass('/maquinas')}>
          Lista de máquinas
        </Link>
      </nav>
      <div className="mt-auto pt-8 border-t border-slate-200">
        <Link
          to="/visao-sgm"
          className={`block px-4 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            isActive('/visao-sgm')
              ? 'bg-slate-200 text-slate-900'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          Visão do SGM
        </Link>
      </div>
    </aside>
  );
}
