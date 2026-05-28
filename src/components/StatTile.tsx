export function StatTile({
  icon, label, value, accent = "neon-blue",
}: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3 hover:border-neon-blue/40 transition">
      <div className={`size-10 rounded-xl grid place-items-center bg-${accent}/15 border border-${accent}/40 text-${accent}`}>
        {icon}
      </div>
      <div className="leading-tight">
        <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="font-display font-bold text-xl">{value}</div>
      </div>
    </div>
  );
}
