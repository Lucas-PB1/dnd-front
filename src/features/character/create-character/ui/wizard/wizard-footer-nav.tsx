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
    <div className="flex flex-wrap gap-2 pt-1" data-cy="wizard-footer">
      {showBack ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          data-cy="wizard-back"
        >
          Voltar
        </Button>
      ) : null}

      {!isLastStep ? (
        <Button type="button" onClick={onNext} data-cy="wizard-continue">
          Continuar
        </Button>
      ) : (
        <Button type="submit" disabled={isSubmitting} data-cy="wizard-submit">
          {isSubmitting ? "Criando ficha…" : "Criar ficha"}
        </Button>
      )}

      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        data-cy="wizard-cancel"
      >
        Cancelar
      </Button>
    </div>
  );
}
