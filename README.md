# multimapkit

<!-- ALL-CONTRIBUTORS-BADGE:START --><!-- ALL-CONTRIBUTORS-BADGE:END -->
[![npm version](https://img.shields.io/npm/v/multimapkit.svg)](https://www.npmjs.com/package/multimapkit)
[![npm downloads](https://img.shields.io/npm/dm/multimapkit.svg)](https://www.npmjs.com/package/multimapkit)
[![CI](https://img.shields.io/github/actions/workflow/status/trananhtung/multimapkit/ci.yml?branch=main)](https://github.com/trananhtung/multimapkit/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Zero-dependency typed MultiMap and SetMultiMap for TypeScript/JavaScript.**

One key, many values — inspired by [Java Guava's Multimap](https://guava.dev/releases/snapshot/api/docs/com/google/common/collect/Multimap.html) and Python's `defaultdict(list)`, now in pure TypeScript with no runtime dependencies.

```ts
import { MultiMap, SetMultiMap } from "multimapkit";

// Group items by category
const mm = MultiMap.groupBy(products, (p) => p.category);
mm.get("electronics"); // [phone, laptop, tablet]

// Unique tags per user
const tags = new SetMultiMap<string, string>();
tags.put("alice", "admin").put("alice", "admin"); // deduped
tags.get("alice"); // Set { "admin" }
```

## Features

- **`MultiMap<K, V>`** — ordered list per key, duplicates allowed
- **`SetMultiMap<K, V>`** — unique values per key (Set semantics), no duplicates
- **`groupBy()`** static factory — group any iterable by key selector
- **`fromEntries()`** — build from `[key, value]` pairs
- **Full iteration** — `keys()`, `values()`, `entries()`, `asMap()`, `[Symbol.iterator]`
- **Serialization** — `toObject()`, `toMap()`
- **Zero dependencies**, TypeScript-first, ESM + CJS

## Install

```bash
npm install multimapkit
```

## Usage

### `MultiMap<K, V>` — ordered values, duplicates allowed

```ts
import { MultiMap } from "multimapkit";

const mm = new MultiMap<string, number>();
mm.put("scores", 10).put("scores", 20).put("scores", 10);
mm.get("scores");    // [10, 20, 10]  — duplicates preserved
mm.size;             // 3  (total entries)
mm.keyCount;         // 1  (distinct keys)

// Bulk add
mm.putAll("scores", [30, 40]);

// Delete
mm.deleteEntry("scores", 10);  // removes first 10  → [20, 10, 30, 40]
mm.delete("scores");           // removes all  → []

// Group an array
const byDept = MultiMap.groupBy(employees, (e) => e.department);
byDept.get("Engineering"); // [alice, bob, carol]

// Iterate every [key, value] pair
for (const [dept, emp] of byDept) {
  console.log(dept, emp.name);
}

// Iterate [key, values[]] — one entry per distinct key
for (const [dept, members] of byDept.asMap()) {
  console.log(dept, members.length);
}
```

### `SetMultiMap<K, V>` — unique values per key

```ts
import { SetMultiMap } from "multimapkit";

const tags = new SetMultiMap<string, string>();
tags.put("post:1", "typescript");
tags.put("post:1", "typescript"); // ignored — already exists
tags.put("post:1", "javascript");
tags.get("post:1"); // Set { "typescript", "javascript" }
tags.size;          // 2

tags.put("post:2", "python");
tags.putAll("post:2", ["python", "go"]); // "python" deduplicated
tags.get("post:2"); // Set { "python", "go" }
```

## API

### `MultiMap<K, V>`

| Method / Property | Description |
|---|---|
| `put(key, value)` | Add a value. Returns `this` (chainable). |
| `putAll(key, values)` | Add multiple values. Returns `this`. |
| `replaceValues(key, values)` | Replace all values; returns old array. |
| `get(key)` | `V[]` — all values, `[]` if absent. |
| `has(key)` | `boolean` — true if key exists. |
| `hasEntry(key, value)` | `boolean` — true if exact pair exists. |
| `delete(key)` | Remove all values; returns removed `V[]`. |
| `deleteEntry(key, value)` | Remove first occurrence; returns `boolean`. |
| `clear()` | Remove all entries. |
| `size` | Total entries (sum of all value arrays). |
| `keyCount` | Number of distinct keys. |
| `keys()` | `IterableIterator<K>` |
| `values()` | `IterableIterator<V>` — flattened. |
| `entries()` | `IterableIterator<[K, V]>` — one per entry. |
| `asMap()` | `IterableIterator<[K, V[]]>` — one per key. |
| `toObject()` | `Record<string, V[]>` |
| `toMap()` | `Map<K, V[]>` (shallow copy) |
| `MultiMap.fromEntries(pairs)` | Static factory from `[K, V]` pairs. |
| `MultiMap.groupBy(items, keyFn)` | Static factory grouping an iterable. |

### `SetMultiMap<K, V>`

Same API as `MultiMap`, with these differences:

| Method / Property | Difference |
|---|---|
| `put(key, value)` | Returns `boolean` (`true` if newly added). |
| `putAll(key, values)` | Returns `number` (count newly added). |
| `get(key)` | `ReadonlySet<V>` — `new Set()` if absent. |
| `delete(key)` | Returns `Set<V>` of removed values. |
| `replaceValues(key, values)` | Deduplicates `values`; returns old `Set<V>`. |

## vs. alternatives

| Package | TypeScript | ESM | MultiMap | SetMultiMap | groupBy | Maintained |
|---------|-----------|-----|----------|-------------|---------|------------|
| **multimapkit** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| multimap | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ (2023) |
| mnemonist | partial | ❌ | ✅ | ❌ | ❌ | ⚠️ |

## Contributors ✨

Contributions of any kind are welcome! See the [contributing guide](https://github.com/all-contributors/all-contributors) and add yourself via `@all-contributors please add @<username> for <contributions>`.

<!-- ALL-CONTRIBUTORS-LIST:START --><!-- ALL-CONTRIBUTORS-LIST:END -->

## License

MIT © [trananhtung](https://github.com/trananhtung)
