import {
  headerBareme, headerIndexSwitchCat,
  performanceDataMen,
} from './ConstantesBaremeAthleMen.tsx'

import {
  performanceDataWomen,
} from './ConstantesBaremeAthleWomen.tsx'

import './Bareme.css'
import { useState } from 'react'
import {
  Button,
  Checkbox,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from '@material-tailwind/react'

export function BaremePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isMenData, setIsMenData] = useState(true) // État pour basculer entre les données hommes/femmes
  const options = Object.keys(isMenData ? performanceDataMen : performanceDataWomen)
  const [selectedDistances, setSelectedDistances] = useState<string[]>([])

  const filteredData = Object.entries(
    isMenData ? performanceDataMen : performanceDataWomen
  ).filter(([distance]) => {
    const normalize = (str: string) => str.replace(/\s/g, '').toLowerCase()
    const searchTermNormalize = normalize(searchTerm)

    const distanceInSearchTerm =
      normalize(distance).includes(searchTermNormalize)

    if (selectedDistances.length) {
      return (
        selectedDistances.includes(distance) ||
        (searchTermNormalize && distanceInSearchTerm)
      )
    }

    return distanceInSearchTerm
  })

  const handleCheckboxChange = (distance: string) => {
    setSelectedDistances((prev) =>
      prev.includes(distance)
        ? prev.filter((d) => d !== distance)
        : [...prev, distance]
    )
  }

  return (
    <>
      <div className={'search_div'}>
        <input
          type="text"
          id="table-search"
          className="custom-input mb-4 top-0 max-w-60"
          placeholder="Recherche d'une distance"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Met à jour le terme de recherche
        />

        <Menu
          dismiss={{
            itemPress: false,
          }}
        >
          <MenuHandler>
            <Button
              variant="outlined"
              className="text-white"
              placeholder={'Search'}
            >
              {selectedDistances.length > 0
                ? `Selected: ${selectedDistances.join(', ')}`
                : 'Selectionner Distances'}
            </Button>
          </MenuHandler>
          <MenuList
            className="max-h-64 overflow-y-auto border-b-4"
            placeholder={'filteredData'}
          >
            {options.map((distance) => (
              <MenuItem
                id={distance}
                key={distance}
                className="flex items-center gap-2 p-2 hover:bg-neutral-950 cursor-pointer w-full border-1 border-black"
                placeholder={'Menu Item'}
                onClick={() => handleCheckboxChange(distance)}
              >
                <Checkbox
                  id={"check"+distance}
                  crossOrigin={''}
                  ripple={false}
                  checked={selectedDistances.includes(distance)}
                  onChange={() => {}}
                  className="appearance-none h-5 w-5 border border-gray-400 rounded-sm checked:bg-blue-600"
                />
                <label className="flex items-center cursor-pointer">{distance}</label>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        {/* Toggle entre hommes et femmes */}
        <Button
          placeholder={'Search'}
          onClick={() => setIsMenData((prev) => !prev)}
          className="toggle-button"
        >
          {isMenData ? 'Afficher Femmes' : 'Afficher Hommes'}
        </Button>
      </div>

      <div className="table_container">
        <table className="table_bareme">
          <thead className="">
          <tr>
            {headerBareme.map((head, index) => (
              <th
                key={index}
                className={
                  'font-semibold py-4 text-white border-black bg-neutral-950 sticky top-0' +
                  (index === 0 ? ' sticky left-0 bg-neutral-950' : '')
                }
              >
                {head}
              </th>
            ))}
          </tr>
          </thead>

          <tbody>
          {filteredData.map(([distance, data], rowIndex) => (
            <tr
              key={distance}
              className={
                rowIndex % 2 === 1 ? 'bg-neutral-950' : 'bg-neutral-800'
              }
            >
              <td className="column_left border-gray-600 font-medium bg-neutral-950 text-white">
                {distance}
              </td>
              {data.perf.map((time, colIndex) => (
                <td
                  key={colIndex}
                  className={"border align-middle border-gray-500 px-4 py-2" + (headerIndexSwitchCat.includes(colIndex) ? " border-l-4 border-l-white" : " border-1")}
                >
                  {time}
                </td>
              ))}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
