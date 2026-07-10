import { describe, expect, it } from "vitest";
import { imageForRole } from "./topicImage";

describe("imageForRole (topic mode)", () => {
  const A = "https://img/a.jpg";
  const B = "https://img/b.jpg";

  it("spies see image B", () => {
    expect(imageForRole("spyA", A, B)).toBe(B);
    expect(imageForRole("spyB", A, B)).toBe(B);
  });

  it("normal and jester see image A", () => {
    expect(imageForRole("normal", A, B)).toBe(A);
    expect(imageForRole("jester", A, B)).toBe(A);
  });
});
