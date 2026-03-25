/**
 * Support & Resistance Level Detection
 *
 * Identifies key price levels where reversals have historically occurred.
 * Uses pivot point detection: a price is a local extremum if it's higher/lower
 * than its N neighbours on both sides.
 *
 * Nearby levels are clustered to avoid noise.
 */

export interface PriceLevel {
  price: number;
  type: 'support' | 'resistance';
  strength: number;  // number of touches/tests (higher = stronger)
  distance: number;  // % distance from current price
}

/**
 * Detect pivot highs and lows.
 * A pivot high at index i means closes[i] >= all closes in [i-window, i+window].
 * A pivot low at index i means closes[i] <= all closes in [i-window, i+window].
 */
function findPivots(
  closes: number[],
  window = 5,
): { pivotHighs: number[]; pivotLows: number[] } {
  const pivotHighs: number[] = [];
  const pivotLows: number[] = [];

  for (let i = window; i < closes.length - window; i++) {
    let isHigh = true;
    let isLow = true;

    for (let j = i - window; j <= i + window; j++) {
      if (j === i) continue;
      if (closes[j] >= closes[i]) isHigh = false;
      if (closes[j] <= closes[i]) isLow = false;
    }

    if (isHigh) pivotHighs.push(closes[i]);
    if (isLow) pivotLows.push(closes[i]);
  }

  return { pivotHighs, pivotLows };
}

/**
 * Cluster nearby price levels within a tolerance (% of price).
 * Returns the average price and count of each cluster.
 */
function clusterLevels(
  prices: number[],
  tolerance = 0.015, // 1.5% default
): { price: number; count: number }[] {
  if (prices.length === 0) return [];

  const sorted = [...prices].sort((a, b) => a - b);
  const clusters: { sum: number; count: number }[] = [];
  let current = { sum: sorted[0], count: 1 };

  for (let i = 1; i < sorted.length; i++) {
    const avg = current.sum / current.count;
    if ((sorted[i] - avg) / avg <= tolerance) {
      current.sum += sorted[i];
      current.count++;
    } else {
      clusters.push(current);
      current = { sum: sorted[i], count: 1 };
    }
  }
  clusters.push(current);

  return clusters.map((c) => ({
    price: Math.round((c.sum / c.count) * 100) / 100,
    count: c.count,
  }));
}

/**
 * Detect support and resistance levels from price history.
 * Returns levels sorted by distance from current price (closest first).
 */
export function detectLevels(
  closes: number[],
  maxLevels = 6,
): PriceLevel[] {
  if (closes.length < 15) return [];

  const currentPrice = closes[closes.length - 1];
  const { pivotHighs, pivotLows } = findPivots(closes);

  const resistanceClusters = clusterLevels(pivotHighs);
  const supportClusters = clusterLevels(pivotLows);

  const levels: PriceLevel[] = [];

  for (const cluster of resistanceClusters) {
    levels.push({
      price: cluster.price,
      type: cluster.price > currentPrice ? 'resistance' : 'support',
      strength: cluster.count,
      distance: Math.round(((cluster.price - currentPrice) / currentPrice) * 10000) / 100,
    });
  }

  for (const cluster of supportClusters) {
    // Avoid duplicates close to already-added resistance clusters
    const duplicate = levels.find(
      (l) => Math.abs(l.price - cluster.price) / currentPrice < 0.01,
    );
    if (duplicate) {
      duplicate.strength += cluster.count;
      continue;
    }

    levels.push({
      price: cluster.price,
      type: cluster.price < currentPrice ? 'support' : 'resistance',
      strength: cluster.count,
      distance: Math.round(((cluster.price - currentPrice) / currentPrice) * 10000) / 100,
    });
  }

  // Sort by distance from current price (closest first)
  levels.sort((a, b) => Math.abs(a.distance) - Math.abs(b.distance));

  return levels.slice(0, maxLevels);
}
