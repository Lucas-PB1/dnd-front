type WizardSubmitErrorProps = {
  error: unknown;
};

export function WizardSubmitError({ error }: WizardSubmitErrorProps) {
  if (!error) return null;

  return (
    <p className="text-sm text-destructive" role="alert">
      {error instanceof Error
        ? error.message
        : "Não foi possível criar a ficha. Tente de novo."}
    </p>
  );
}
