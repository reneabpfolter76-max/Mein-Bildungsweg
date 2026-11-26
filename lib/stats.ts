import { durationMinutes, effectiveStatus, monthCostEur } from "@/lib/cases";
import { RATING_LABELS, type Case, type Level, type Ratings } from "@/lib/types";

export interface Stats {
  total: number;
  byLevel: Record<Level | "ohne", number>;
  byStatus: Record<string, number>;
  completionRate: number;
  abandonRate: number;
  handoverRate: number;
  levelChangeCases: number;
  avgDurationMin: number;
  simulatedBookings: number;
  avgRatings: Partial<Record<keyof Ratings, number>>;
  avgOverallRating: number | null;
  releases: Record<string, number>;
  topTopics: [string, number][];
  uncoveredNeeds: string[];
  monthCostEur: number;
  totalCostEur: number;
  testers: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function computeStats(cases: Case[], now = new Date()): Stats {
  const byLevel: Stats["byLevel"] = { L1: 0, L2: 0, L3: 0, ohne: 0 };
  const byStatus: Record<string, number> = {};
  const releases: Record<string, number> = {};
  const topics = new Map<string, number>();
  const ratingSums: Partial<Record<keyof Ratings, number>> = {};
  let rated = 0;
  let durationSum = 0;

  for (const c of cases) {
    byLevel[c.finalLevel ?? "ohne"]++;
    const st = effectiveStatus(c, now);
    byStatus[st] = (byStatus[st] ?? 0) + 1;
    durationSum += durationMinutes(c, now);
    if (c.topic) {
      const t = c.topic.trim().toLowerCase();
      topics.set(t, (topics.get(t) ?? 0) + 1);
    }
    if (c.customerRelease) releases[c.customerRelease] = (releases[c.customerRelease] ?? 0) + 1;
    if (c.ratings) {
      rated++;
      for (const k of Object.keys(RATING_LABELS) as (keyof Ratings)[]) {
        ratingSums[k] = (ratingSums[k] ?? 0) + c.ratings[k];
      }
    }
  }

  const n = cases.length;
  const avgRatings: Stats["avgRatings"] = {};
  if (rated) for (const k of Object.keys(ratingSums) as (keyof Ratings)[]) avgRatings[k] = round1(ratingSums[k]! / rated);
  const ratingValues = Object.values(avgRatings);
  const pct = (x: number) => (n ? round1((x / n) * 100) : 0);

  return {
    total: n,
    byLevel,
    byStatus,
    completionRate: pct((byStatus["abgeschlossen"] ?? 0) + (byStatus["uebergeben"] ?? 0)),
    abandonRate: pct(byStatus["abgebrochen"] ?? 0),
    handoverRate: pct(cases.filter((c) => c.handover).length),
    levelChangeCases: cases.filter((c) => c.levelChanges.length > 1).length,
    avgDurationMin: n ? round1(durationSum / n) : 0,
    simulatedBookings: cases.reduce((s, c) => s + c.bookings.length, 0),
    avgRatings,
    avgOverallRating: ratingValues.length ? round1(ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length) : null,
    releases,
    topTopics: [...topics.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
    uncoveredNeeds: cases.map((c) => c.uncoveredNeed).filter((x): x is string => !!x),
    monthCostEur: monthCostEur(cases, now),
    totalCostEur: cases.reduce((s, c) => s + c.costEur, 0),
    testers: new Set(cases.map((c) => c.testerId)).size,
  };
}
