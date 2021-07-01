const typeofObj = typeof {};

function eitherIsNil(a: unknown | null, b: unknown | null): boolean {
  return a == null || b == null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Diff = (objA: Record<string, any>, objB: Record<string, any>) => boolean;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function shallowObjDiff(a: Record<string, any>, b: Record<string, any>): boolean {
  if (eitherIsNil(a, b) && !(a == null && b == null)) {
    return true;
  }

  if (a === b) {
    // can't do a diff on the same obj
    return false;
  }

  // non-object values can be compared with the equality operator
  if (typeof a !== typeofObj || typeof b !== typeofObj) {
    return a !== b;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aKeys = Object.keys(a as Record<string, any>);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bKeys = Object.keys(a as Record<string, any>);
  const mismatches = (key: string) => a[key] !== b[key];

  if (aKeys.length !== bKeys.length) {
    return true;
  }

  return aKeys.some(mismatches) || bKeys.some(mismatches);
}
