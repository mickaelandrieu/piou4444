import { describe, it, expect } from "vitest";

describe("test runner", () => {
  it("executes a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });
});
