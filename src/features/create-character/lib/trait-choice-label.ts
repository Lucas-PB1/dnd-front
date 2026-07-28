export function traitChoiceLabel(kind: string, traitName: string): string {
  switch (kind) {
    case "human_origin_feat":
      return "Versátil — talento";
    case "human_skill":
      return "Hábil — perícia";
    case "elf_keen_senses":
      return "Sentidos aguçados — perícia";
    case "elf_casting_ability":
    case "gnome_casting_ability":
    case "infernal_casting_ability":
      return "Atributo de conjuração";
    case "aasimar_size":
    case "tiefling_size":
    case "human_size":
      return "Tamanho";
    case "high_elf_cantrip":
      return "Truque de Alto Elfo (opcional)";
    default:
      return traitName;
  }
}
