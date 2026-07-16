import { describe, expect, it } from "vitest";
import { validateImageLink } from "./playerImage";

describe("validateImageLink", () => {
  it("รับเฉพาะ http/https", () => {
    expect(validateImageLink("https://example.com/a.webp")).toBe("https://example.com/a.webp");
    expect(validateImageLink("  http://a.b/c.png  ")).toBe("http://a.b/c.png");
    expect(() => validateImageLink("javascript:alert(1)")).toThrow("ลิงก์รูปต้องขึ้นต้นด้วย http");
    expect(() => validateImageLink("")).toThrow("ลิงก์รูปต้องขึ้นต้นด้วย http");
  });
});
