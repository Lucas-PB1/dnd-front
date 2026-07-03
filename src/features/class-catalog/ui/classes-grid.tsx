"use client";

import { useClasses } from "@/features/class-catalog/api/use-classes";
import { ClassCard } from "@/features/class-catalog/ui/class-card";

export function ClassesGrid() {
  const { data, isPending, isError, error } = useClasses();

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando classes…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Erro ao carregar classes"}
      </p>
    );
  }

  if (!data?.data.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma classe encontrada na API.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {data.data.map((classItem) => (
        <ClassCard key={classItem.slug} classItem={classItem} />
      ))}
    </div>
  );
}
