import { Button } from "@/shared/ui/button";

type WizardFooterNavProps = {
  showBack: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
};

export function WizardFooterNav({
  showBack,
  isLastStep,
  isSubmitting,
  onBack,
  onNext,
  onCancel,
}: WizardFooterNavProps) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {showBack ? (
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
      ) : null}

      {!isLastStep ? (
        <Button type="button" onClick={onNext}>
          Continuar
        </Button>
      ) : (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando ficha…" : "Criar ficha"}
        </Button>
      )}

      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  );
}
