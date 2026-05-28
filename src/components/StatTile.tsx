export function StatTile({
  icon, label, value, color = "text-neon-blue", ring = "border-neon-blue/40", bg = "bg-neon-blue/15",
}: { icon: React.ReactNode; label: string; value: React.ReactNode; color?: string; ring?: string; bg?: string }) {
  return (
    <div className="group relative glass rounded-2xl p-4 flex items-center gap-3 tilt hover:border-neon-blue/50 overflow-hidden">
      <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition shimmer rounded-2xl" />
      <div className={`size-11 rounded-xl grid place-items-center border ${bg} ${ring} ${color} shadow-[inset_0_0_18px_rgba(255,255,255,0.04)]`}>
        {icon}
      </div>
      <div className="leading-tight min-w-0">
        <div className="text-[10px] text-muted-foreground uppercase tracking-[0.14em]">{label}</div>
        <div className="font-display font-bold text-xl truncate">{value}</div>
      </div>
    </div>
  );
}
