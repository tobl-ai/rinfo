interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, children, className }: SectionProps) {
  return (
    <section className={className}>
      <h2 className="mb-4 text-lg font-semibold text-rinfo-800">{title}</h2>
      {children}
    </section>
  );
}
