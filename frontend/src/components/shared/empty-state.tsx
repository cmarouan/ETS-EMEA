import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <section className="border-border bg-card rounded-lg border border-dashed p-8 text-center">
      <h2 className="font-medium">{title}</h2>
      {description ? <p className="text-muted-foreground mt-2 text-sm">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}
