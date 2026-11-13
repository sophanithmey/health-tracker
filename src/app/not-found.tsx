import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-center font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-md">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested page could not be located.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl text-sm transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

