const PORTRAITS: Record<string, string> = {
  luke: "/am/luke.jpg",
  sara: "/am/sarah.jpg",
  vitali: "/am/vitali.jpg",
  mark: "/am/mark.jpg",
  noor: "/am/noor.jpg",
  jonas: "/am/jonas.jpg",
};

const COVERS: Record<string, string> = {
  citylab: "/am/hof.jpg",
  sara: "/am/interior.jpg",
  luke: "/am/city.jpg",
};

export const RING = [
  "/am/luke.jpg",
  "/am/sarah.jpg",
  "/am/mark.jpg",
  "/am/noor.jpg",
  "/am/jonas.jpg",
  "/am/vitali.jpg",
];

export function portrait(id: string) {
  return PORTRAITS[id];
}

export function coverFor(id: string) {
  return COVERS[id];
}
