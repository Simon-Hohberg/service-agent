export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  let clone = { ...obj };
  for (let key of keys) {
    delete clone[key];
  }
  return clone;
}
