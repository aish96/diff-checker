import React, { useState, useEffect } from 'react'
import DiffViewer from './components/DiffViewer'
import ObjectEditor from './components/ObjectEditor'
import { obj1 as source, obj2 as target } from './mocks/nestedObjects'
import { obj1 as source2, obj2 as target2 } from './mocks/nestedObjects2'
import { deepDiffMapper } from './utils/utils'

const App: React.FC = () => {
  const [obj1, setObj1] = useState<any>(source)
  const [obj2, setObj2] = useState<any>(target)
  const [differences, setDifferences] = useState<any>(null)
  const [selectedEg, setSelectedEg] = useState<'1' | '2'>('1')

  const compareObjects = () => {
    try {
      const diff = deepDiffMapper(obj1, obj2, {
        ignoreArraySequence: true,
        caseInsensitive: true,
        ignorePatterns: ['company.departments.teamLead', 'age'],
        keyForArrayCheck: 'name'
      })
      setDifferences(diff)
      console.log('diff', diff)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === '1') {
      setObj1(source)
      setObj2(target)
    } else {
      setObj1(source2)
      setObj2(target2)
    }
    setSelectedEg(value === '1' ? '1' : '2')
  }

  useEffect(() => {
    compareObjects()
  }, [obj1, obj2])

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Object Comparator</h1>
        <div>
          <select
            value={selectedEg}
            className="border border-gray-300 p-2 rounded w-48"
            onChange={handleSelectChange}
          >
            <option value="1" selected>
              Example Object 1
            </option>
            <option value="2">Example Object 2</option>
          </select>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex space-x-4 min-h-[300px]">
          <ObjectEditor obj={obj1} setObj={setObj1} title="Source Object" />
          <ObjectEditor obj={obj2} setObj={setObj2} title="Target Object" />
        </div>
        {differences && (
          <div className="mt-4 rounded border border-gray-300">
            <div className="bg-gray-300 p-2 font-bold">Differences</div>
            <DiffViewer diff={differences} obj1={obj1} obj2={obj2} />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
