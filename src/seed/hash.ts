export function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
    h = (h + (h << 13)) | 0;
    h ^= h >>> 7;
    h = (h + (h << 3)) | 0;
    h ^= h >>> 17;
    h = (h + (h << 5)) | 0;
  }
  return h >>> 0;
}
