export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-center">
      <div>
        <p className="text-6xl font-semibold text-cyan-400">404</p>
        <h2 className="mt-4 text-3xl font-semibold">Page not found</h2>
        <p className="mt-2 text-slate-400">The route you requested doesn’t exist.</p>
      </div>
    </div>
  );
}
