export default function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <Icon className={`text-${accent}`} />
      </div>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}
