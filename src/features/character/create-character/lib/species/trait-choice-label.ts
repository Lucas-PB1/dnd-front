export function traitChoiceLabel(kind: string, traitName: string): string {
  switch (kind) {
    case "human_origin_feat":
      return "Versátil — talento";
    case "human_skill":
      return "Hábil — perícia";
    case "elf_keen_senses":
      return "Sentidos aguçados — perícia";
    case "geppettin_skill":
      return "Qualidade artesanal — perícia";
    case "mandrake_skill":
      return "Conexão natural — perícia";
    case "geppettin_construction":
      return "Construção Geppettin";
    case "mandrake_season":
      return "Estação da colheita";
    case "elf_casting_ability":
    case "gnome_casting_ability":
    case "infernal_casting_ability":
    case "mandrake_casting_ability":
      return "Atributo de conjuração";
    case "aasimar_size":
    case "tiefling_size":
    case "human_size":
    case "geppettin_size":
      return "Tamanho";
    case "high_elf_cantrip":
      return "Truque de Alto Elfo (opcional)";
    case "andari_druid_cantrip":
      return "Dádiva da Natureza — truque de Druida";
    case "bearfolk_lineage":
      return "Linhagem do Povo-urso";
    default:
      return traitName;
  }
}
