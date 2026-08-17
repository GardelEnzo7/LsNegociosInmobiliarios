/**
 * Runs `worker` over `items` with at most `limit` calls in flight at once —
 * used to cap simultaneous browser→Supabase Storage uploads instead of
 * firing them all at the same time.
 */
export async function mapWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
}
