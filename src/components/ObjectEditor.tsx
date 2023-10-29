import { useState, useEffect } from 'react'

interface TextEditorProps {
  title: string
  obj: any
  setObj: (obj: any) => void
}

export default function ObjectEditor({ title, obj, setObj }: TextEditorProps) {
  const [stringObj, setStringObj] = useState(JSON.stringify(obj, null, 2))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setStringObj(JSON.stringify(obj, null, 2))
  }, [obj])

  const updateObj = (str: string) => {
    try {
      setError(null)
      setStringObj(str)
      const parsedObj = JSON.parse(str)
      setObj(parsedObj)
    } catch (error) {
      setError('Error in JSON input')
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="bg-gray-300 p-2 font-bold">{title}</div>

      <textarea
        className="border border-gray-300 p-2 flex-1 peer block min-h-[auto] w-full rounded bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none"
        value={stringObj}
        onChange={(e) => updateObj(e.target.value)}
        placeholder="Enter JSON object 1 here"
      />
      {error && <div className="text-red-500">{error}</div>}
    </div>
  )
}
