import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "@/lib/crm/csv";

describe("CSV export safety", () => {
  it("neutralizes spreadsheet formulas", () => {
    expect(csvCell("=cmd")).toBe("\"'=cmd\"");
    expect(csvCell("+SUM(1,1)")).toBe("\"'+SUM(1,1)\"");
    expect(csvCell("@HYPERLINK")).toBe("\"'@HYPERLINK\"");
  });

  it("quotes normal CSV values", () => {
    expect(csvCell('Guest "A"')).toBe('"Guest ""A"""');
  });

  it("exports rows with headers", () => {
    expect(toCsv([{ name: "=bad", status: "ok" }])).toContain("name,status");
    expect(toCsv([{ name: "=bad", status: "ok" }])).toContain("\"'=bad\"");
  });
});
