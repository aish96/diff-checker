import React from 'react'
import { DiffMapperType } from '../utils/utils'

interface DiffViewerProps {
  obj1: any
  obj2: any
  diff: any
}

const DiffViewer: React.FC<DiffViewerProps> = ({ obj1, obj2, diff }) => {
  const renderDiff = (currentDiff: any, depth = 0) => {
    const indentation = `${depth * 20}px`

    return Object.keys(currentDiff).map((key, index) => {
      const diffType = currentDiff[key].type

      if (!diffType) {
        return (
          <div key={key} style={{ paddingLeft: indentation }}>
            {key}: {'{'}
            <div>{renderDiff(currentDiff[key], depth + 1)}</div>
            {'}'}
          </div>
        )
      }

      switch (diffType) {
        case DiffMapperType.VALUE_UNCHANGED:
          return (
            <div
              key={index}
              style={{ paddingLeft: indentation }}
              className="text-gray-500"
            >
              {key}: {JSON.stringify(currentDiff[key].oldValue)}
            </div>
          )
        case DiffMapperType.VALUE_CREATED:
          return (
            <div
              key={index}
              style={{ paddingLeft: indentation }}
              className="p-1 rounded bg-green-200"
            >
              {key}: {JSON.stringify(currentDiff[key].newValue)}
            </div>
          )
        case DiffMapperType.VALUE_DELETED:
          return (
            <div key={index} style={{ paddingLeft: indentation }}>
              {key}:{' '}
              <span className="p-1 rounded bg-red-200">
                {JSON.stringify(currentDiff[key].oldValue)}
              </span>
            </div>
          )
        case DiffMapperType.VALUE_UPDATED:
          return (
            <div key={index} style={{ paddingLeft: indentation }}>
              <span>
                {key}:{' '}
                <span className="p-1 rounded bg-red-200">
                  {JSON.stringify(currentDiff[key].oldValue)}
                </span>
              </span>
              <span className="px-2 text-gray-600">→</span>
              <span className="p-1 rounded bg-green-200">
                {JSON.stringify(currentDiff[key].newValue)}
              </span>
            </div>
          )
        default:
          return null
      }
    })
  }

  return <div className="p-4">{renderDiff(diff)}</div>
}

export default DiffViewer
