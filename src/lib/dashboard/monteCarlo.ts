import type { MonteCarloSimulation } from "@/lib/dashboard/types";

interface MonteCarloConfig {
  initialPrice: number;
  mu: number;
  sigma: number;
  muAdjustment: number;
  sigmaMultiplier: number;
  timeHorizonYears?: number;
  numSimulations?: number;
  stepsPerYear?: number;
  sampledPaths?: number;
  eventSentiment?: number;
  asset?: string;
}

function randomNormal(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(Math.max(u1, 1e-12))) * Math.cos(2 * Math.PI * u2);
}

function percentileFromSorted(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) {
    return 0;
  }
  const index = (sortedValues.length - 1) * percentile;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) {
    return sortedValues[lower];
  }
  const weight = index - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

export function runMonteCarloSimulation(config: MonteCarloConfig): MonteCarloSimulation {
  const timeHorizonYears = config.timeHorizonYears ?? 0.25;
  const numSimulations = config.numSimulations ?? 1_200;
  const sampledPaths = Math.min(config.sampledPaths ?? 80, numSimulations);
  const stepsPerYear = config.stepsPerYear ?? 252;

  const muFinal = config.mu + config.muAdjustment;
  const sigmaFinal = config.sigma * config.sigmaMultiplier;

  const steps = Math.max(1, Math.floor(timeHorizonYears * stepsPerYear));
  const dt = 1 / stepsPerYear;

  const paths: number[][] = [];
  const meanPath = Array.from({ length: steps + 1 }, () => 0);
  const percentile5 = Array.from({ length: steps + 1 }, () => 0);
  const percentile95 = Array.from({ length: steps + 1 }, () => 0);

  for (let i = 0; i < numSimulations; i++) {
    const path = [config.initialPrice];

    for (let step = 1; step <= steps; step++) {
      const z = randomNormal();
      const drift = (muFinal - 0.5 * sigmaFinal * sigmaFinal) * dt;
      const diffusion = sigmaFinal * Math.sqrt(dt) * z;
      path.push(path[step - 1] * Math.exp(drift + diffusion));
    }

    paths.push(path);
    for (let step = 0; step <= steps; step++) {
      meanPath[step] += path[step];
    }
  }

  for (let step = 0; step <= steps; step++) {
    meanPath[step] /= numSimulations;
    const sorted = paths.map((path) => path[step]).sort((a, b) => a - b);
    percentile5[step] = percentileFromSorted(sorted, 0.05);
    percentile95[step] = percentileFromSorted(sorted, 0.95);
  }

  // Synthetic realized path with a short event shock around day 15.
  const actualPrice = [config.initialPrice];
  const eventShock = (config.eventSentiment ?? 0) * 0.03;

  for (let step = 1; step <= steps; step++) {
    const z = randomNormal();
    let shock = 0;
    if (step === 15) {
      shock = eventShock;
    } else if (step === 16) {
      shock = eventShock * 0.5;
    }

    const drift = (config.mu - 0.5 * config.sigma * config.sigma) * dt;
    const diffusion = config.sigma * Math.sqrt(dt) * z;
    actualPrice.push(actualPrice[step - 1] * Math.exp(drift + diffusion + shock));
  }

  const sampleStride = Math.max(1, Math.floor(numSimulations / sampledPaths));
  const sampled = paths.filter((_, i) => i % sampleStride === 0).slice(0, sampledPaths);

  return {
    times: Array.from({ length: steps + 1 }, (_, step) => step / stepsPerYear),
    paths: sampled,
    meanPath,
    percentiles: {
      "5th": percentile5,
      "95th": percentile95,
    },
    actualPrice,
    initialPrice: config.initialPrice,
    muFinal,
    sigmaFinal,
    numSimulations,
    asset: config.asset ?? "SOY",
  };
}
