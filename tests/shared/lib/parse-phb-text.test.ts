import { describe, expect, it } from "vitest";

import { parsePhbText } from "@/shared/lib/parse-phb-text";

describe("parsePhbText", () => {
  it("joins soft line breaks into paragraphs", () => {
    const blocks = parsePhbText(
      "Você aprimorou suas proezas marciais e tem um\ntalento de Estilo de Luta à sua escolha.",
    );
    expect(blocks).toEqual([
      {
        type: "paragraph",
        text: "Você aprimorou suas proezas marciais e tem um talento de Estilo de Luta à sua escolha.",
      },
    ]);
  });

  it("parses bullet lists", () => {
    const blocks = parsePhbText("- Um\n- Dois\n- Três");
    expect(blocks).toEqual([{ type: "list", items: ["Um", "Dois", "Três"] }]);
  });
});
