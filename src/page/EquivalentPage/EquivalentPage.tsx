import {useState} from "react";
import {defaultTime, Time, timeToPace} from "../../interface/Time.tsx";
import {TimeInput} from "../../component/TimeInput.tsx";
import {equivalent, equivalentPurdyPoint, getKeys} from "../../Utils/Utils.tsx";
import {Distance, DistanceInfo, distancesInfo} from "../../Utils/Constants.tsx";
import {paceToString} from "../../interface/Pace.tsx";

export function EquivalentPage() {

    const [times, setTimes] = useState<Distance<Time>>({
        Marathon: defaultTime,
        SemiMarathon: defaultTime,
        km10: defaultTime,
        km5: defaultTime,
        km3: defaultTime
    })

    const handleTimeChange = (distance: keyof DistanceInfo, newValue: Time) => {

        const updatedTimes: Record<keyof DistanceInfo, Time> = {...times}

        getKeys(distancesInfo).map(key => {
            if (key === distance) {
                updatedTimes[key as keyof DistanceInfo] = newValue;
            } else {
                updatedTimes[key as keyof DistanceInfo] = equivalentPurdyPoint(
                    newValue,
                    distancesInfo[distance].distance,
                    distancesInfo[key].distance
                );
            }
        })

        setTimes(updatedTimes)
    }


    return (
        <>
            <h2>Page equivalence de performance</h2>

            <table>
                <thead>
                <tr>
                    <td>Distance</td>
                    <td>Temps</td>
                    <td>Pace</td>
                </tr>
                </thead>
                <tbody>
                {(Object.keys(times) as Array<keyof typeof times>).map((distance) => {
                    return (
                        <tr key={distance}>
                            <td>{distancesInfo[distance].name}</td>
                            <td>
                                <TimeInput
                                    value={times[distance]}
                                    onTimeChange={(newValue) => {
                                        handleTimeChange(distance, newValue);
                                    }}
                                />
                            </td>
                            <td>
                                {
                                    paceToString(
                                        timeToPace(times[distance], distancesInfo[distance].distance)
                                    )
                                }
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </>
    )
}
