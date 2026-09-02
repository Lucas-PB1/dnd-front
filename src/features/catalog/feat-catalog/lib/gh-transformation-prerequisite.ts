/** Placeholder legado em J019 — o aviso âmbar no detalhe já cobre isso. */
export const GH_TRANSFORMATION_OPTIONAL_PREREQ =
  "Transformação opcional — ver Grim Hollow PG Cap. 6";

export function isGhTransformationOptionalPrerequisite(
  categorySlug: string | undefined,
  prerequisite: string | null | undefined,
): boolean {
  return (
    categorySlug === "gh-transformation" &&
    prerequisite?.trim() === GH_TRANSFORMATION_OPTIONAL_PREREQ
  );
}
