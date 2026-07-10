import { describe, expect, it } from "vitest";
import { assignSpyRoles, findSpyPartner, promoteJester } from "./roleEngine";

describe("assignSpyRoles", () => {
  it("assigns exactly one spy A and one spy B", () => {
    const roles = assignSpyRoles(["A", "B", "C", "D"], () => 0);
    expect(Object.values(roles).filter((role) => role === "spyA")).toHaveLength(1);
    expect(Object.values(roles).filter((role) => role === "spyB")).toHaveLength(1);
  });

  it("assigns normal to everyone else", () => {
    const roles = assignSpyRoles(["A", "B", "C", "D"], () => 0);
    expect(Object.values(roles).filter((role) => role === "normal")).toHaveLength(2);
  });

  it("throws when fewer than two players are available", () => {
    expect(() => assignSpyRoles(["A"], () => 0)).toThrow("At least two players are required");
  });

  it("finds the other spy partner", () => {
    expect(findSpyPartner({ A: "spyA", B: "spyB", C: "normal" }, "A")).toBe("B");
  });

  it("promoteJester turns exactly one eligible normal into a jester, never a spy", () => {
    const roles = { A: "spyA", B: "spyB", C: "normal", D: "normal", E: "normal" } as const;
    const next = promoteJester(roles, ["A", "B", "C", "D", "E"], () => 0);
    expect(Object.values(next).filter((r) => r === "jester")).toHaveLength(1);
    expect(next.A).toBe("spyA");
    expect(next.B).toBe("spyB");
  });

  it("promoteJester leaves roles unchanged when no eligible normal remains", () => {
    const roles = { A: "spyA", B: "spyB" } as const;
    expect(promoteJester(roles, ["A", "B"], () => 0)).toEqual(roles);
  });

  it("promoteJester never picks an absent (non-eligible) player", () => {
    const roles = { A: "spyA", B: "spyB", C: "normal", D: "normal" } as const;
    // D ลา (ไม่อยู่ใน eligible) → jester ต้องเป็น C เท่านั้น
    const next = promoteJester(roles, ["A", "B", "C"], () => 0);
    expect(next.C).toBe("jester");
    expect(next.D).toBe("normal");
  });
});
