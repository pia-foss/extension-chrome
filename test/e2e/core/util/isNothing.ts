export type Nothing = null | undefined;

export function isNothing(value: any): value is Nothing {
  return (typeof value === 'undefined' || value === null);
}
