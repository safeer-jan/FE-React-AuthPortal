import { Link } from 'react-router-dom';
import { ShieldAlert, FileQuestion } from 'lucide-react';

export function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <ShieldAlert className="text-danger" size={32} />
      <h1 className="text-lg font-semibold text-text">You don't have access to this page</h1>
      <p className="max-w-sm text-sm text-text-muted">
        Your account doesn't have the permissions needed to view this. Ask an admin if you think this is wrong.
      </p>
      <Link to="/" className="text-sm text-accent hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <FileQuestion className="text-text-muted" size={32} />
      <h1 className="text-lg font-semibold text-text">Page not found</h1>
      <Link to="/" className="text-sm text-accent hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
