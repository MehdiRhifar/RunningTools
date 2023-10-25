import {useState} from "react";
import {defaultTime, Time, timeToPace} from "../../interface/Time.tsx";
import {TimeInput} from "../../component/TimeInput.tsx";
import {getKeys} from "../../Utils/Utils.tsx";
import {Distance, DistanceInfo, distancesInfo} from "../../Utils/Constants.tsx";
import {paceToString} from "../../interface/Pace.tsx";
import {equivalentPurdyPoint, equivalentPurdyPointV2, purdyPoints, purdyPointV2} from "../../Utils/PurdyPoints.tsx";

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
                updatedTimes[key] = newValue;
            } else {
                updatedTimes[key] = equivalentPurdyPoint(
                    purdyPoints(distancesInfo[distance].distance, newValue),
                    distancesInfo[key].distance);
                console.log(
                    equivalentPurdyPoint(purdyPoints(distancesInfo[distance].distance, newValue),
                        distancesInfo[key].distance),
                    equivalentPurdyPointV2(purdyPointV2(distancesInfo[distance].distance, newValue),
                        distancesInfo[key].distance)
                )
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
