type TableActionFeedbackProps = {
  lastResultNote?: string | null;
  error?: unknown;
};

export function TableActionFeedback({
  lastResultNote,
  error,
}: TableActionFeedbackProps) {
  return (
    <>
      {lastResultNote ? (
        <p className="mt-2 text-sm text-secondary" role="status">
          {lastResultNote}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error instanceof Error
            ? error.message
            : "Não foi possível executar a ação"}
        </p>
      ) : null}
    </>
  );
}
