// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Get = (obj: Record<string, any>, key: string) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const get = (obj: Record<string, any>, key: string): any => (obj != null ? obj[key] : null);


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToJson = (obj: Record<string, any>) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toJson(obj: Record<string, any>): any {
  return obj;
}

export type ForEach<T> = (arr: T[], iterator: Iterator<T>) => void;
type Iterator<T> = (value: T, index: number, array: T[]) => void;

export function forEach<T>(arr: T[], iterator: Iterator<T>): void {
  arr.forEach(iterator);
}
