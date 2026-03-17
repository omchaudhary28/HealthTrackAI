import { populationBenchmarks } from "../data/population-stats.js";
import { PopulationStat } from "../models/population-stat.model.js";

function percentileFromDistribution(distribution, score) {
  if (!distribution.length) {
    return 50;
  }

  const belowOrEqual = distribution.filter((value) => value <= score).length;
  return Math.round((belowOrEqual / distribution.length) * 100);
}

export async function getPopulationComparison(metric, score) {
  const record = await PopulationStat.findOne({ metric }).lean().catch(() => null);
  const distribution = record?.distribution?.length
    ? record.distribution
    : populationBenchmarks[metric] || [];

  const percentile = percentileFromDistribution(distribution, score);

  return {
    metric,
    percentile,
    summary: `You scored higher ${metric.replace(/_/g, " ")} than ${percentile}% of users.`
  };
}

export async function seedPopulationBenchmarks() {
  const operations = Object.entries(populationBenchmarks).map(([metric, distribution]) =>
    PopulationStat.findOneAndUpdate(
      { metric },
      { metric, distribution, lastUpdatedAt: new Date() },
      { upsert: true, new: true }
    )
  );

  return Promise.all(operations);
}
