import { describe, expect, it } from "vitest";
import { assignSpyRoles, findSpyPartner } from "./roleEngine";

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
});
