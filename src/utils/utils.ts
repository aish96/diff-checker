/* eslint-disable @typescript-eslint/no-explicit-any */

export enum DiffMapperType {
  VALUE_CREATED = 'added',
  VALUE_UPDATED = 'updated',
  VALUE_DELETED = 'deleted',
  VALUE_UNCHANGED = 'unchanged'
}

export interface DiffResult {
  type?: DiffMapperType
  oldValue?: any
  newValue?: any
}

const isFunction = (x: any): boolean => typeof x === 'function'
const isArray = (x: any): boolean => Array.isArray(x)
const isDate = (x: any): boolean => x instanceof Date
const isObject = (x: any): boolean =>
  typeof x === 'object' && x !== null && !isArray(x)
const isValue = (x: any): boolean => !isObject(x) && !isArray(x)

const shouldIgnore = (ignorePatterns: string[], currentPath: string[]) => {
  return ignorePatterns.some((pattern) =>
    new RegExp(`^${pattern.replace(/\./g, '\\.')}$`).test(currentPath.join('.'))
  )
}

const unchanged = (
  value1: any,
  value2: any,
  caseInsensitive: boolean
): boolean => {
  if (value1 === value2 && !caseInsensitive) return true
  if (
    value1?.toString().toLowerCase() === value2?.toString().toLowerCase() &&
    caseInsensitive
  )
    return true
  if (isDate(value1) && isDate(value2))
    return value1.getTime() === value2.getTime()
  return false
}

const compareArrays = (
  arr1: any[],
  arr2: any[],
  caseInsensitive: boolean,
  currentPath: string[] = [],
  ignorePatterns: string[] = [],
  ignoreArraySequence: boolean,
  key?: string
): DiffResult => {
  const diff: { [index: number]: DiffResult } = {}

  if (ignoreArraySequence) {
    const arr1Copy = [...arr1]
    const arr2Copy = [...arr2]
    arr1Copy.sort((a, b) => (key ? a[key] - b[key] : a - b))
    arr2Copy.sort((a, b) => (key ? a[key] - b[key] : a - b))
    arr1Copy.forEach((item, index) => {
      diff[index] = compareData(
        item,
        arr2Copy[index],
        caseInsensitive,
        currentPath,
        ignorePatterns,
        ignoreArraySequence,
        key
      )
    })
    return diff
  } else {
    arr1.forEach((item, index) => {
      diff[index] = compareData(
        item,
        arr2[index],
        caseInsensitive,
        currentPath,
        ignorePatterns,
        ignoreArraySequence,
        key
      )
    })
    return diff
  }
}

const compareValues = (
  value1: any,
  value2: any,
  caseInsensitive: boolean
): DiffMapperType => {
  if (unchanged(value1, value2, caseInsensitive))
    return DiffMapperType.VALUE_UNCHANGED
  if (value1 === undefined) return DiffMapperType.VALUE_CREATED
  if (value2 === undefined) return DiffMapperType.VALUE_DELETED
  return DiffMapperType.VALUE_UPDATED
}

const compareData = (
  obj1: any,
  obj2: any,
  caseInsensitive: boolean,
  currentPath: string[] = [],
  ignorePatterns: string[] = [],
  ignoreArraySequence = false,
  keyForArrayCheck?: string
): DiffResult => {
  if (shouldIgnore(ignorePatterns, currentPath)) {
    return {
      type: DiffMapperType.VALUE_UNCHANGED,
      oldValue: obj1
    }
  }

  if (isArray(obj1) && isArray(obj2)) {
    return compareArrays(
      obj1,
      obj2,
      caseInsensitive,
      currentPath,
      ignorePatterns,
      ignoreArraySequence,
      keyForArrayCheck
    )
  }

  if (isValue(obj1) || isValue(obj2)) {
    const type = compareValues(obj1, obj2, caseInsensitive)
    return {
      type,
      oldValue: obj1 === undefined ? obj2 : obj1,
      newValue:
        type === DiffMapperType.VALUE_UPDATED ||
        type === DiffMapperType.VALUE_CREATED
          ? obj2
          : undefined
    }
  }

  const diff: { [key: string]: DiffResult } = {}

  Object.keys(obj1).forEach((key) => {
    if (!isFunction(obj1[key])) {
      const value2 = obj2[key]
      diff[key] = compareData(
        obj1[key],
        value2,
        caseInsensitive,
        [...currentPath, key],
        ignorePatterns,
        ignoreArraySequence,
        keyForArrayCheck
      )
    }
  })

  Object.keys(obj2).forEach((key) => {
    if (!isFunction(obj2[key]) && diff[key] === undefined) {
      diff[key] = compareData(
        undefined,
        obj2[key],
        caseInsensitive,
        [...currentPath, key],
        ignorePatterns,
        ignoreArraySequence,
        keyForArrayCheck
      )
    }
  })

  return diff
}

export const deepDiffMapper = (
  obj1: any,
  obj2: any,
  options: {
    caseInsensitive?: boolean
    ignorePatterns?: string[]
    ignoreArraySequence?: boolean
    keyForArrayCheck?: string
  } = {}
): DiffResult => {
  const {
    caseInsensitive = false,
    ignorePatterns = [],
    ignoreArraySequence = false,
    keyForArrayCheck
  } = options

  return compareData(
    obj1,
    obj2,
    caseInsensitive,
    [],
    ignorePatterns,
    ignoreArraySequence,
    keyForArrayCheck
  )
}
