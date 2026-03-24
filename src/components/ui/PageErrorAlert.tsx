import { Link } from 'react-router-dom';

interface PageErrorAlertProps {
  title: string;
  message: string;
  /** Detalhe técnico discreto (não é o foco principal). */
  detail?: string | null;
  backTo?: { label: string; to: string };
}

export function PageErrorAlert({ title, message, detail, backTo }: PageErrorAlertProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-900 shadow-sm">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-relaxed">{message}</p>
      {detail ? (
        <p className="mt-3 rounded-md border border-red-100 bg-white/60 px-2 py-1.5 font-mono text-[11px] leading-snug text-red-800/90 break-all">
          {detail}
        </p>
      ) : null}
      {backTo ? (
        <Link
          to={backTo.to}
          className="mt-4 inline-block text-sm font-medium text-red-800 underline decoration-red-300 underline-offset-2 hover:text-red-950"
        >
          {backTo.label}
        </Link>
      ) : null}
    </div>
  );
}
