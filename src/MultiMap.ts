/**
 * MultiMap<K, V> — one key maps to an ordered list of values (duplicates allowed).
 * Inspired by Java Guava's ArrayListMultimap and Python's defaultdict(list).
 */
export class MultiMap<K, V> {
  private readonly _map: Map<K, V[]> = new Map();
  private _size = 0;

  /** Total number of key-value entries (not the number of distinct keys). */
  get size(): number {
    return this._size;
  }

  /** Number of distinct keys. */
  get keyCount(): number {
    return this._map.size;
  }

  /** Associate `value` with `key`. Duplicates are preserved in insertion order. */
  put(key: K, value: V): this {
    let arr = this._map.get(key);
    if (!arr) { arr = []; this._map.set(key, arr); }
    arr.push(value);
    this._size++;
    return this;
  }

  /** Associate every value in `values` with `key`. */
  putAll(key: K, values: Iterable<V>): this {
    for (const v of values) this.put(key, v);
    return this;
  }

  /**
   * Replace all values for `key` with `values`.
   * Returns the previous value array (may be empty).
   */
  replaceValues(key: K, values: Iterable<V>): V[] {
    const prev = this.get(key);
    this._size -= prev.length;
    const next = [...values];
    if (next.length === 0) {
      this._map.delete(key);
    } else {
      this._map.set(key, next);
      this._size += next.length;
    }
    return prev;
  }

  /** All values associated with `key`, in insertion order. Never throws — returns `[]` if absent. */
  get(key: K): V[] {
    return this._map.get(key) ?? [];
  }

  /** True if `key` has at least one associated value. */
  has(key: K): boolean {
    return this._map.has(key);
  }

  /** True if the exact key-value pair exists. */
  hasEntry(key: K, value: V): boolean {
    return (this._map.get(key) ?? []).includes(value);
  }

  /**
   * Remove all values for `key`.
   * Returns the removed values (empty array if key was absent).
   */
  delete(key: K): V[] {
    const arr = this._map.get(key);
    if (!arr) return [];
    this._map.delete(key);
    this._size -= arr.length;
    return arr;
  }

  /**
   * Remove the first occurrence of `value` under `key`.
   * Returns `true` if an entry was removed.
   */
  deleteEntry(key: K, value: V): boolean {
    const arr = this._map.get(key);
    if (!arr) return false;
    const idx = arr.indexOf(value);
    if (idx === -1) return false;
    arr.splice(idx, 1);
    this._size--;
    if (arr.length === 0) this._map.delete(key);
    return true;
  }

  /** Remove all entries. */
  clear(): void {
    this._map.clear();
    this._size = 0;
  }

  /** Iterate over distinct keys. */
  keys(): IterableIterator<K> {
    return this._map.keys();
  }

  /** Iterate over every value across all keys (flattened, in key-insertion order). */
  values(): IterableIterator<V> {
    return this._flatValues();
  }

  private *_flatValues(): Generator<V> {
    for (const arr of this._map.values()) yield* arr;
  }

  /** Iterate over `[key, value]` pairs — one pair per entry, not per key. */
  entries(): IterableIterator<[K, V]> {
    return this._flatEntries();
  }

  private *_flatEntries(): Generator<[K, V]> {
    for (const [k, arr] of this._map) for (const v of arr) yield [k, v];
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  /** Iterate over `[key, valuesArray]` pairs — one pair per distinct key. */
  asMap(): IterableIterator<[K, V[]]> {
    return this._map.entries();
  }

  /**
   * Convert to a plain object `{ [key]: V[] }`.
   * Only valid when K extends string | number | symbol.
   */
  toObject(): Record<string, V[]> {
    const out: Record<string, V[]> = Object.create(null) as Record<string, V[]>;
    for (const [k, arr] of this._map) out[String(k)] = [...arr];
    return out;
  }

  /** Convert to a `Map<K, V[]>` (shallow copy of internal state). */
  toMap(): Map<K, V[]> {
    const m = new Map<K, V[]>();
    for (const [k, arr] of this._map) m.set(k, [...arr]);
    return m;
  }

  /** Build a MultiMap from an iterable of `[key, value]` pairs. */
  static fromEntries<K, V>(entries: Iterable<[K, V]>): MultiMap<K, V> {
    const mm = new MultiMap<K, V>();
    for (const [k, v] of entries) mm.put(k, v);
    return mm;
  }

  /**
   * Build a MultiMap by grouping an iterable by a key selector.
   * Equivalent to Guava's `Multimaps.index()` or Python's `groupby`.
   */
  static groupBy<K, V>(items: Iterable<V>, keyFn: (item: V) => K): MultiMap<K, V> {
    const mm = new MultiMap<K, V>();
    for (const item of items) mm.put(keyFn(item), item);
    return mm;
  }

  get [Symbol.toStringTag](): string {
    return "MultiMap";
  }
}
