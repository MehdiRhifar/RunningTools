import { Time, timeToTotalSeconds } from '../interface/Time.tsx'
import { totalSecondsToTime } from './Utils.tsx'

const portugueseTable: Record<number, number> = {
  40.0: 11.0,
  50.0: 10.996,
  60.0: 10.983,
  70.0: 10.962,
  80.0: 10.934,
  90.0: 10.9,
  100.0: 10.86,
  110.0: 10.815,
  120.0: 10.765,
  130.0: 10.711,
  140.0: 10.654,
  150.0: 10.594,
  160.0: 10.531,
  170.0: 10.465,
  180.0: 10.396,
  200.0: 10.25,
  220.0: 10.096,
  240.0: 9.935,
  260.0: 9.771,
  280.0: 9.61,
  300.0: 9.455,
  320.0: 9.307,
  340.0: 9.166,
  360.0: 9.032,
  380.0: 8.905,
  400.0: 8.785,
  450.0: 8.513,
  500.0: 8.279,
  550.0: 8.083,
  600.0: 7.921,
  700.0: 7.669,
  800.0: 7.496,
  900.0: 7.32,
  1000.0: 7.18933,
  1200.0: 6.98066,
  1500.0: 6.75319,
  2000.0: 6.50015,
  2500.0: 6.33424,
  3000.0: 6.21913,
  3500.0: 6.1351,
  4000.0: 6.0704,
  4500.0: 6.01822,
  5000.0: 5.97432,
  6000.0: 5.90181,
  7000.0: 5.84156,
  8000.0: 5.78889,
  9000.0: 5.74211,
  10000.0: 5.7005,
  12000.0: 5.62944,
  15000.0: 5.543,
  20000.0: 5.43785,
  21098.0: 5.420407172,
  25000.0: 5.35842,
  30000.0: 5.29298,
  35000.0: 5.23538,
  40000.0: 5.18263,
  42195.0: 5.16145264,
  50000.0: 5.08615,
  60000.0: 4.99762,
  80000.0: 4.83617,
  100000.0: 4.68988,
}

function calculateFractionOnTurns(distance: number): number {
  let laps, meters
  let turnDistance
  let partLap = 0

  if (distance < 110) {
    return 0
  } else {
    laps = Math.floor(distance / 400)
    meters = distance - laps * 400

    if (meters <= 50) {
      partLap = 0
    } else if (meters <= 150) {
      partLap = meters - 50
    } else if (meters <= 250) {
      partLap = 100
    } else if (meters <= 350) {
      partLap = 100 + (meters - 250)
    } else if (meters <= 400) {
      partLap = 200
    }

    turnDistance = laps * 200 + partLap
    return turnDistance / distance
  }
}

function constPurdyPointV2(referenceDistance: number) {
  const b1 = 11.15895
  const b2 = 4.304605
  const b3 = 0.5234627
  const b4 = 4.03156
  const b5 = 2.316157
  const r1 = 3.796158e-2
  const r2 = 1.646772e-3
  const r3 = 4.10767e-4
  const r4 = 7.068099e-6
  const r5 = 5.22099e-9

  // Calculate world record velocity from running curve for the reference distance
  const speedWR =
    -b1 * Math.exp(-r1 * referenceDistance) +
    b2 * Math.exp(-r2 * referenceDistance) +
    b3 * Math.exp(-r3 * referenceDistance) +
    b4 * Math.exp(-r4 * referenceDistance) +
    b5 * Math.exp(-r5 * referenceDistance)

  // Calculate world record time for the reference distance
  const timeWR = referenceDistance / speedWR

  // Calculate least squares Purdy Points for the reference distance
  const k = 0.0654 - 0.00258 * speedWR
  const a = 85 / k
  const b = 1 - 1035 / a
  return [a, b, timeWR]
}

function getConstPurdyPoints(distance: number) {
  const c1 = 0.2
  const c2 = 0.08
  const c3 = 0.0065

  if (distance < 0 || distance > 100_000) {
    return [0, 0, 0]
  }
  // t est le temps pour 950 points pour notre distance
  let t, v
  if (distance in portugueseTable) {
    t = distance / portugueseTable[distance]
    v = portugueseTable[distance]
  } else {
    const distancesArray = Object.keys(portugueseTable).map(Number)
    // Trouver la distance la plus proche dans le tableau, mais ne pas dépasser la distance donnée
    const distancesFiltered = distancesArray.filter((d) => d <= distance)
    const d1 = distancesFiltered[distancesFiltered.length - 1] // Dernière distance ne dépassant pas la distance donnée
    const t1 = d1 / portugueseTable[d1] // Temps pour d1

    // Si la distance donnée n'est pas dans le tableau, utilisez la distance et le temps suivants
    const nextIndex = Math.min(
      distancesFiltered.length,
      distancesArray.length - 1,
    )
    const d3 = distancesArray[nextIndex]
    const t3 = d3 / portugueseTable[d3]

    // Utiliser l'interpolation linéaire pour obtenir le temps d'une performance de 950 points
    t = t1 + ((t3 - t1) * (distance - d1)) / (d3 - d1)
    v = distance / t
  }

  // Ajouter le ralentissement du départ et des virages
  const time950 =
    t + c1 + c2 * v + c3 * calculateFractionOnTurns(distance) * v * v

  // Calculer les points Purdy
  const k = 0.0654 - 0.00258 * v
  const a = 85 / k
  const b = 1 - 950 / a
  return [a, b, time950]
}

export function purdyPoints(
  referenceDistance: number,
  referenceTime: Time,
): number {
  const [a, b, timeWR] = getConstPurdyPoints(referenceDistance)
  const totalSeconds = timeToTotalSeconds(referenceTime)
  return a * (timeWR / totalSeconds - b)
}

export function purdyPointV2(referenceDistance: number, referenceTime: Time) {
  const [a, b, timeWR] = constPurdyPointV2(referenceDistance)
  const refTime = timeToTotalSeconds(referenceTime)
  return a * (timeWR / refTime - b)
}

export function equivalentPurdyPoint(
  point: number,
  targetDistance: number,
): Time {
  if (targetDistance < 0 || targetDistance > 100_000) {
    return totalSecondsToTime(0)
  }

  const [a, b, t950] = getConstPurdyPoints(targetDistance)
  const seconds = t950 / (point / a + b)

  return totalSecondsToTime(seconds)
}

export function equivalentPurdyPointV2(
  point: number,
  targetDistance: number,
): Time {
  // Distance cible pour laquelle vous voulez estimer le temps
  const [a, b, timeWR] = constPurdyPointV2(targetDistance)
  const totalSecRes = timeWR / (point / a + b)
  return totalSecondsToTime(totalSecRes)
}
