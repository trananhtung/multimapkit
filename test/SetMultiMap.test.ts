import { SetMultiMap } from "../src/index.js";

describe("SetMultiMap — construction", () => {
  test("starts empty", () => {
    const mm = new SetMultiMap<string, number>();
    expect(mm.size).toBe(0);
    expect(mm.keyCount).toBe(0);
  });

  test("fromEntries deduplicates same key-value pair", () => {
    const mm = SetMultiMap.fromEntries([["a", 1], ["a", 1], ["a", 2]]);
    expect(mm.get("a")).toEqual(new Set([1, 2]));
    expect(mm.size).toBe(2);
  });

  test("groupBy deduplicates per group", () => {
    const mm = SetMultiMap.groupBy(["a", "a", "b"], (s) => s);
    expect(mm.keyCount).toBe(2);
    expect(mm.size).toBe(2);
  });
});

describe("SetMultiMap — put", () => {
  test("put returns true on new entry, false on duplicate", () => {
    const mm = new SetMultiMap<string, number>();
    expect(mm.put("k", 1)).toBe(true);
    expect(mm.put("k", 1)).toBe(false);
    expect(mm.put("k", 2)).toBe(true);
    expect(mm.size).toBe(2);
  });

  test("putAll returns count of newly added", () => {
    const mm = new SetMultiMap<string, number>();
    mm.put("k", 1);
    const added = mm.putAll("k", [1, 2, 3]);
    expect(added).toBe(2); // 1 already existed
    expect(mm.get("k").size).toBe(3);
  });
});

describe("SetMultiMap — get / has / hasEntry", () => {
  test("get returns empty Set for absent key", () => {
    const mm = new SetMultiMap<string, number>();
    expect(mm.get("x")).toEqual(new Set());
  });

  test("has / hasEntry", () => {
    const mm = new SetMultiMap<string, number>();
    mm.put("a", 5);
    expect(mm.has("a")).toBe(true);
    expect(mm.has("b")).toBe(false);
    expect(mm.hasEntry("a", 5)).toBe(true);
    expect(mm.hasEntry("a", 9)).toBe(false);
  });
});

describe("SetMultiMap — delete / deleteEntry", () => {
  test("delete removes all values, returns them", () => {
    const mm = new SetMultiMap<string, number>();
    mm.put("k", 1); mm.put("k", 2);
    const removed = mm.delete("k");
    expect(removed).toEqual(new Set([1, 2]));
    expect(mm.has("k")).toBe(false);
    expect(mm.size).toBe(0);
  });

  test("delete returns empty Set for absent key", () => {
    const mm = new SetMultiMap<string, number>();
    expect(mm.delete("x")).toEqual(new Set());
  });

  test("deleteEntry removes the specific value", () => {
    const mm = new SetMultiMap<string, number>();
    mm.put("k", 1); mm.put("k", 2);
    expect(mm.deleteEntry("k", 1)).toBe(true);
    expect(mm.get("k").has(1)).toBe(false);
    expect(mm.get("k").has(2)).toBe(true);
    expect(mm.size).toBe(1);
  });

  test("deleteEntry returns false if entry absent", () => {
    const mm = new SetMultiMap<string, number>();
    mm.put("k", 1);
    expect(mm.deleteEntry("k", 99)).toBe(false);
    expect(mm.deleteEntry("z", 1)).toBe(false);
  });

  test("deleteEntry removes key when last value removed", () => {
    const mm = new SetMultiMap<string, number>();
    mm.put("k", 1);
    mm.deleteEntry("k", 1);
    expect(mm.has("k")).toBe(false);
    expect(mm.keyCount).toBe(0);
  });
});

describe("SetMultiMap — replaceValues", () => {
  test("replaceValues swaps values, deduplicates new set", () => {
    const mm = new SetMultiMap<string, number>();
    mm.put("k", 1); mm.put("k", 2);
    const prev = mm.replaceValues("k", [3, 3, 4]);
    expect(prev).toEqual(new Set([1, 2]));
    expect(mm.get("k")).toEqual(new Set([3, 4]));
    expect(mm.size).toBe(2);
  });
});

describe("SetMultiMap — clear", () => {
  test("clear empties everything", () => {
    const mm = new SetMultiMap<string, number>();
    mm.put("a", 1); mm.put("b", 2);
    mm.clear();
    expect(mm.size).toBe(0);
    expect(mm.keyCount).toBe(0);
  });
});

describe("SetMultiMap — iteration", () => {
  test("keys() yields distinct keys", () => {
    const mm = new SetMultiMap<string, number>();
    mm.put("b", 1); mm.put("a", 2);
    expect([...mm.keys()]).toEqual(["b", "a"]);
  });

  test("values() yields all values flattened (unique per key)", () => {
    const mm = new SetMultiMap<string, number>();
    mm.put("a", 1); mm.put("a", 2); mm.put("b", 3);
    const vals = new Set(mm.values());
    expect(vals).toEqual(new Set([1, 2, 3]));
  });

  test("entries() yields [key, value] pairs", () => {
    const mm = new SetMultiMap<string, number>();
    mm.put("a", 1); mm.put("b", 2);
    const pairs = [...mm.entries()];
    expect(pairs).toContainEqual(["a", 1]);
    expect(pairs).toContainEqual(["b", 2]);
  });

  test("[Symbol.iterator] same as entries()", () => {
    const mm = new SetMultiMap<string, number>();
    mm.put("x", 9);
    expect([...mm]).toEqual([["x", 9]]);
  });

  test("asMap() yields [key, ReadonlySet] pairs", () => {
    const mm = new SetMultiMap<string, number>();
    mm.put("a", 1); mm.put("a", 2); mm.put("b", 3);
    const pairs = [...mm.asMap()];
    expect(pairs.length).toBe(2);
    const aSet = pairs.find(([k]) => k === "a")?.[1];
    expect(aSet).toEqual(new Set([1, 2]));
  });
});
