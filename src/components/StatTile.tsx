export function StatTile({
  icon, label, value, color = "text-neon-blue", ring = "border-neon-blue/40", bg = "bg-neon-blue/15",
}: { icon: React.ReactNode; label: string; value: React.ReactNode; color?: string; ring?: string; bg?: string }) {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3 hover:border-neon-blue/40 transition">
      <div className={`size-10 rounded-xl grid place-items-center border ${bg} ${ring} ${color}`}>
        {icon}
      </div>
      <div className="leading-tight">
        <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="font-display font-bold text-xl">{value}</div>
      </div>
    </div>
  );
}
