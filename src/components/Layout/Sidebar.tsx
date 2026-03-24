import { Link, useLocation } from 'react-router-dom';

export function Sidebar() {
  const location = useLocation();

  const linkClass = (path: string) =>
    `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      location.pathname.startsWith(path)
        ? 'bg-slate-700 text-white'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <aside className="w-56 bg-slate-50 border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4">
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
    </aside>
  );
}
