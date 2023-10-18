import {useState} from "react";
import {defaultTime, Time} from "../../interface/Time.tsx";
import {TimeInput} from "../../component/TimeInput.tsx";
import {equivalent} from "../../Utils/Utils.tsx";
import {Distance, DistanceInfo, distancesInfo} from "../../Utils/Constants.tsx";

export function EquivalentPage() {

    const [times, setTimes] = useState<Distance<Time>>({
        Marathon: defaultTime,
        SemiMarathon: defaultTime,
        km10: defaultTime
    })

    const handleTimeChange = (distance : keyof DistanceInfo, newValue : Time) => {
        console.log(distance)
        switch (distance) {
          case "Marathon":
            setTimes({
              Marathon: newValue,
              SemiMarathon: equivalent(
                newValue,
                distancesInfo.Marathon.distance,
                distancesInfo.SemiMarathon.distance,
              ),
              km10: equivalent(
                newValue,
                distancesInfo.Marathon.distance,
                distancesInfo.km10.distance,
              ),
            }); break
          case "km10":
              setTimes({
                  Marathon: equivalent(
                      newValue,
                      distancesInfo.km10.distance,
                      distancesInfo.Marathon.distance,
                  ),
                  SemiMarathon: equivalent(
                      newValue,
                      distancesInfo.km10.distance,
                      distancesInfo.SemiMarathon.distance,
                  ),
                  km10: newValue
              }); break
            case "SemiMarathon":
                setTimes({
                    Marathon: equivalent(
                        newValue,
                        distancesInfo.SemiMarathon.distance,
                        distancesInfo.km10.distance,
                    ),
                    SemiMarathon: newValue,
                    km10: equivalent(
                        newValue,
                        distancesInfo.SemiMarathon.distance,
                        distancesInfo.km10.distance,
                    ),
                }); break
        }
    }


    return (
        <>
            <h2>Page equivalence de performance</h2>

            <table>
                <thead>
                    <tr>
                        <td>Distance</td>
                        <td>Temps</td>
                    </tr>
                </thead>
                <tbody>
                    {(Object.keys(times) as Array<keyof typeof times>).map((distance) => (
                        <tr key={distance}>
                            <td>{distance}</td>
                            <td>
                                <TimeInput
                                    value={times[distance]}
                                    onTimeChange={(newValue) => { handleTimeChange(distance, newValue); }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}