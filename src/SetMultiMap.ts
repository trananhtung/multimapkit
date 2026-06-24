/**
 * SetMultiMap<K, V> — one key maps to a set of unique values (no duplicates).
 * Inspired by Java Guava's HashMultimap / LinkedHashMultimap.
 */
export class SetMultiMap<K, V> {
  private readonly _map: Map<K, Set<V>> = new Map();
  private _size = 0;

  /** Total number of key-value entries (not the number of distinct keys). */
  get size(): number {
    return this._size;
  }

  /** Number of distinct keys. */
  get keyCount(): number {
    return this._map.size;
  }

  /**
   * Associate `value` with `key`.
   * Returns `true` if the entry was newly added, `false` if it already existed.
   */
  put(key: K, value: V): boolean {
    let set = this._map.get(key);
    if (!set) { set = new Set(); this._map.set(key, set); }
    if (set.has(value)) return false;
    set.add(value);
    this._size++;
    return true;
  }

  /** Associate every value in `values` with `key`. Returns the number of newly added entries. */
  putAll(key: K, values: Iterable<V>): number {
    let added = 0;
    for (const v of values) if (this.put(key, v)) added++;
    return added;
  }

  /**
   * Replace all values for `key` with the unique values in `values`.
   * Returns the previous value set (may be empty).
   */
  replaceValues(key: K, values: Iterable<V>): Set<V> {
    const prev = new Set(this._map.get(key));
    this._size -= prev.size;
    const next = new Set(values);
    if (next.size === 0) {
      this._map.delete(key);
    } else {
      this._map.set(key, next);
      this._size += next.size;
    }
    return prev;
  }

  /** All unique values associated with `key`. Returns an empty Set if absent. */
  get(key: K): ReadonlySet<V> {
    return this._map.get(key) ?? new Set<V>();
  }

  /** True if `key` has at least one associated value. */
  has(key: K): boolean {
    return this._map.has(key);
  }

  /** True if the exact key-value pair exists. */
  hasEntry(key: K, value: V): boolean {
    return (this._map.get(key)?.has(value)) ?? false;
  }

  /** Remove all values for `key`. Returns the removed Set (empty if key was absent). */
  delete(key: K): Set<V> {
    const set = this._map.get(key);
    if (!set) return new Set<V>();
    this._map.delete(key);
    this._size -= set.size;
    return set;
  }

  /** Remove the `value` under `key`. Returns `true` if an entry was removed. */
  deleteEntry(key: K, value: V): boolean {
    const set = this._map.get(key);
    if (!set?.has(value)) return false;
    set.delete(value);
    this._size--;
    if (set.size === 0) this._map.delete(key);
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

  /** Iterate over every unique value across all keys (flattened, in key-insertion order). */
  values(): IterableIterator<V> {
    return this._flatValues();
  }

  private *_flatValues(): Generator<V> {
    for (const set of this._map.values()) yield* set;
  }

  /** Iterate over `[key, value]` pairs — one pair per entry. */
  entries(): IterableIterator<[K, V]> {
    return this._flatEntries();
  }

  private *_flatEntries(): Generator<[K, V]> {
    for (const [k, set] of this._map) for (const v of set) yield [k, v];
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  /** Iterate over `[key, valueSet]` pairs — one pair per distinct key. */
  asMap(): IterableIterator<[K, ReadonlySet<V>]> {
    return this._map.entries() as IterableIterator<[K, ReadonlySet<V>]>;
  }

  /** Build a SetMultiMap from an iterable of `[key, value]` pairs. */
  static fromEntries<K, V>(entries: Iterable<[K, V]>): SetMultiMap<K, V> {
    const mm = new SetMultiMap<K, V>();
    for (const [k, v] of entries) mm.put(k, v);
    return mm;
  }

  /**
   * Build a SetMultiMap by grouping an iterable by a key selector.
   * Duplicates per group are automatically deduplicated.
   */
  static groupBy<K, V>(items: Iterable<V>, keyFn: (item: V) => K): SetMultiMap<K, V> {
    const mm = new SetMultiMap<K, V>();
    for (const item of items) mm.put(keyFn(item), item);
    return mm;
  }

  get [Symbol.toStringTag](): string {
    return "SetMultiMap";
  }
}
