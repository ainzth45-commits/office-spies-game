import { describe, expect, it } from "vitest";
import { topicViewFor } from "./topicImage";

describe("topicViewFor (topic mode)", () => {
  const A = "https://img/a.jpg";
  const B = "https://img/b.jpg";

  it("spies see image B", () => {
    expect(topicViewFor("spyA", false, A, B)).toEqual({ kind: "image", url: B });
    expect(topicViewFor("spyB", false, A, B)).toEqual({ kind: "image", url: B });
  });

  it("normal players see image A", () => {
    expect(topicViewFor("normal", false, A, B)).toEqual({ kind: "image", url: A });
  });

  it("a leaked normal player sees image B (like a spy)", () => {
    expect(topicViewFor("normal", true, A, B)).toEqual({ kind: "image", url: B });
  });

  it("jester sees no image", () => {
    expect(topicViewFor("jester", false, A, B)).toEqual({ kind: "jester" });
    // แม้ถูกเลือกเป็นคนรั่วก็ยังไม่มีภาพ (คนบ้ามาก่อน)
    expect(topicViewFor("jester", true, A, B)).toEqual({ kind: "jester" });
  });
});
