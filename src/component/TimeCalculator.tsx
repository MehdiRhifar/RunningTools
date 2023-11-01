import {Time, timeToString, timeToTotalSeconds} from "../interface/Time.tsx";

type TimeCalculatorProps = {
  distance: number;
  time: Time;
};

export function TimeCalculator({ distance, time }: TimeCalculatorProps) {
    const timeSec = timeToTotalSeconds(time)
  const calculatePassingTimes = () => {
      const timeInHours = timeSec / 3600; // Convert time to hours
      const timeInMinutes = timeSec / 60; // Convert time to minutes

    const time100m = (100 * timeSec) /  distance;
    const time200m = (200 * timeSec) /  distance;
    const time400m = (400 * timeSec) /  distance;

    return {
      time100m,
      time200m,
      time400m,
    };
  };

  const passingTimes = calculatePassingTimes();

  return (
    <div>
      <h2>Temps de passage</h2>
      <p>Distance: {distance} m</p>
      <p>Temps: {timeToString(time)} secondes</p>
      <p>Temps de passage au 100m : {passingTimes.time100m.toFixed(2)} seconds</p>
      <p>Temps de passage au 200m : {passingTimes.time200m.toFixed(2)} seconds</p>
      <p>Temps de passage au 400m : {passingTimes.time400m.toFixed(2)} seconds</p>
    </div>
  );
}
