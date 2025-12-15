type TradeInAppleOnlyProps = {
  className?: string;
};

export function TradeInAppleOnly({ className }: TradeInAppleOnlyProps) {
  return (
    <section
      className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm ${className ?? ""}`.trim()}
    >
      <h2 className="text-lg font-semibold text-foreground">Трейд-ин хөтөлбөр</h2>
      <p className="text-secondary mt-1">Хуучин утсаа ирүүлээд шинийг аваарай</p>
    </section>
  );
}
