import { MultiMap } from "../src/index.js";

describe("MultiMap — construction", () => {
  test("starts empty", () => {
    const mm = new MultiMap<string, number>();
    expect(mm.size).toBe(0);
    expect(mm.keyCount).toBe(0);
  });

  test("fromEntries", () => {
    const mm = MultiMap.fromEntries([["a", 1], ["a", 2], ["b", 3]]);
    expect(mm.get("a")).toEqual([1, 2]);
    expect(mm.get("b")).toEqual([3]);
    expect(mm.size).toBe(3);
  });

  test("groupBy", () => {
    const mm = MultiMap.groupBy(["apple", "avocado", "banana", "blueberry"], (s) => s[0]);
    expect(mm.get("a")).toEqual(["apple", "avocado"]);
    expect(mm.get("b")).toEqual(["banana", "blueberry"]);
    expect(mm.keyCount).toBe(2);
  });
});

describe("MultiMap — put / get", () => {
  test("put associates value with key", () => {
    const mm = new MultiMap<string, number>();
    mm.put("x", 1).put("x", 2).put("y", 3);
    expect(mm.get("x")).toEqual([1, 2]);
    expect(mm.get("y")).toEqual([3]);
    expect(mm.size).toBe(3);
    expect(mm.keyCount).toBe(2);
  });

  test("get returns [] for absent key (no throw)", () => {
    const mm = new MultiMap<string, number>();
    expect(mm.get("missing")).toEqual([]);
  });

  test("allows duplicate values", () => {
    const mm = new MultiMap<string, number>();
    mm.put("k", 1).put("k", 1).put("k", 1);
    expect(mm.get("k")).toEqual([1, 1, 1]);
    expect(mm.size).toBe(3);
  });

  test("putAll associates multiple values at once", () => {
    const mm = new MultiMap<string, number>();
    mm.putAll("k", [10, 20, 30]);
    expect(mm.get("k")).toEqual([10, 20, 30]);
    expect(mm.size).toBe(3);
  });
});

describe("MultiMap — has / hasEntry", () => {
  test("has returns true only when key exists", () => {
    const mm = new MultiMap<string, number>();
    mm.put("a", 1);
    expect(mm.has("a")).toBe(true);
    expect(mm.has("b")).toBe(false);
  });

  test("hasEntry checks exact pair", () => {
    const mm = new MultiMap<string, number>();
    mm.put("a", 1).put("a", 2);
    expect(mm.hasEntry("a", 1)).toBe(true);
    expect(mm.hasEntry("a", 9)).toBe(false);
    expect(mm.hasEntry("z", 1)).toBe(false);
  });
});

describe("MultiMap — delete", () => {
  test("delete removes all values for key", () => {
    const mm = new MultiMap<string, number>();
    mm.putAll("k", [1, 2, 3]);
    const removed = mm.delete("k");
    expect(removed).toEqual([1, 2, 3]);
    expect(mm.has("k")).toBe(false);
    expect(mm.size).toBe(0);
  });

  test("delete returns [] for absent key", () => {
    const mm = new MultiMap<string, number>();
    expect(mm.delete("nope")).toEqual([]);
    expect(mm.size).toBe(0);
  });

  test("deleteEntry removes first occurrence only", () => {
    const mm = new MultiMap<string, number>();
    mm.putAll("k", [1, 2, 1]);
    expect(mm.deleteEntry("k", 1)).toBe(true);
    expect(mm.get("k")).toEqual([2, 1]);
    expect(mm.size).toBe(2);
  });

  test("deleteEntry returns false when entry absent", () => {
    const mm = new MultiMap<string, number>();
    mm.put("k", 1);
    expect(mm.deleteEntry("k", 99)).toBe(false);
    expect(mm.deleteEntry("z", 1)).toBe(false);
  });

  test("deleteEntry removes key when last value removed", () => {
    const mm = new MultiMap<string, number>();
    mm.put("k", 42);
    mm.deleteEntry("k", 42);
    expect(mm.has("k")).toBe(false);
    expect(mm.keyCount).toBe(0);
  });
});

describe("MultiMap — replaceValues", () => {
  test("replaceValues swaps out values and returns old ones", () => {
    const mm = new MultiMap<string, number>();
    mm.putAll("k", [1, 2, 3]);
    const prev = mm.replaceValues("k", [7, 8]);
    expect(prev).toEqual([1, 2, 3]);
    expect(mm.get("k")).toEqual([7, 8]);
    expect(mm.size).toBe(2);
  });

  test("replaceValues with empty removes key", () => {
    const mm = new MultiMap<string, number>();
    mm.put("k", 1);
    mm.replaceValues("k", []);
    expect(mm.has("k")).toBe(false);
    expect(mm.size).toBe(0);
  });
});

describe("MultiMap — clear", () => {
  test("clear resets everything", () => {
    const mm = new MultiMap<string, number>();
    mm.putAll("a", [1, 2]).putAll("b", [3]);
    mm.clear();
    expect(mm.size).toBe(0);
    expect(mm.keyCount).toBe(0);
    expect([...mm.keys()]).toEqual([]);
  });
});

describe("MultiMap — iteration", () => {
  test("keys() yields distinct keys", () => {
    const mm = new MultiMap<string, number>();
    mm.put("b", 1).put("a", 2).put("b", 3);
    expect([...mm.keys()]).toEqual(["b", "a"]);
  });

  test("values() yields all values flattened", () => {
    const mm = new MultiMap<string, number>();
    mm.put("a", 1).put("a", 2).put("b", 3);
    expect([...mm.values()]).toEqual([1, 2, 3]);
  });

  test("entries() yields [key, value] pairs", () => {
    const mm = new MultiMap<string, number>();
    mm.put("a", 1).put("a", 2).put("b", 3);
    expect([...mm.entries()]).toEqual([["a", 1], ["a", 2], ["b", 3]]);
  });

  test("[Symbol.iterator] same as entries()", () => {
    const mm = new MultiMap<string, number>();
    mm.put("x", 9);
    expect([...mm]).toEqual([["x", 9]]);
  });

  test("asMap() yields [key, valuesArray] pairs", () => {
    const mm = new MultiMap<string, number>();
    mm.put("a", 1).put("a", 2).put("b", 3);
    const pairs = [...mm.asMap()];
    expect(pairs).toEqual([["a", [1, 2]], ["b", [3]]]);
  });
});

describe("MultiMap — serialization", () => {
  test("toObject", () => {
    const mm = new MultiMap<string, number>();
    mm.put("a", 1).put("a", 2).put("b", 3);
    const obj = mm.toObject();
    expect(obj["a"]).toEqual([1, 2]);
    expect(obj["b"]).toEqual([3]);
  });

  test("toMap", () => {
    const mm = new MultiMap<string, number>();
    mm.put("a", 1).put("b", 2);
    const m = mm.toMap();
    expect(m instanceof Map).toBe(true);
    expect(m.get("a")).toEqual([1]);
    expect(m.get("b")).toEqual([2]);
    // shallow copy — mutating shouldn't affect original
    m.get("a")!.push(99);
    expect(mm.get("a")).toEqual([1]);
  });
});
