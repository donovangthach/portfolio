import type { Stage } from "./stages";

export const colors = {
  top: "#e5e7eb",
  front: "#22c55e",
  right: "#ef4444",
  back: "#3b82f6",
  left: "#f97316",
  bottom: "#facc15",
};
type Face = keyof typeof colors;
const faceNames = Object.keys(colors) as Face[];

type Vec = [number, number, number];
type Sticker = { spot: Vec; facing: Vec; color: string };
type Cube = { size: number; stickers: Sticker[] };

const facings: Record<Face, Vec> = {
  top: [0, 1, 0],
  front: [0, 0, 1],
  right: [1, 0, 0],
  back: [0, 0, -1],
  left: [-1, 0, 0],
  bottom: [0, -1, 0],
};

function spotOf(face: Face, row: number, col: number, size: number): Vec {
  const edge = size - 1;
  const across = col * 2 - edge;
  const up = edge - row * 2;
  if (face === "top") return [across, edge, -up];
  if (face === "front") return [across, up, edge];
  if (face === "right") return [edge, up, -across];
  if (face === "back") return [-across, up, -edge];
  if (face === "left") return [-edge, up, across];
  return [across, -edge, up];
}

function solvedCube(size: number): Cube {
  const stickers: Sticker[] = [];
  for (const face of faceNames) {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        stickers.push({ spot: spotOf(face, row, col, size), facing: facings[face], color: colors[face] });
      }
    }
  }
  return { size, stickers };
}

export function readFaces(cube: Cube) {
  const { size } = cube;
  const lookup = new Map(cube.stickers.map((s) => [`${s.spot} ${s.facing}`, s.color]));
  return faceNames.map((name) => ({
    name,
    stickers: Array.from({ length: size * size }, (_, i) => {
      const spot = spotOf(name, Math.floor(i / size), i % size, size);
      return lookup.get(`${spot} ${facings[name]}`)!;
    }),
  }));
}

function quarter([x, y, z]: Vec, axis: number): Vec {
  if (axis === 0) return [x, -z, y];
  if (axis === 1) return [z, y, -x];
  return [-y, x, z];
}

const sides = {
  R: { axis: 0, sign: 1 },
  L: { axis: 0, sign: -1 },
  U: { axis: 1, sign: 1 },
  D: { axis: 1, sign: -1 },
  F: { axis: 2, sign: 1 },
  B: { axis: 2, sign: -1 },
};

export function turn(cube: Cube, moves: string) {
  for (const move of moves.split(" ").filter(Boolean)) {
    const match = move.match(/^(\d?)([RLUDFB])(['2]?)$/);
    if (!match) throw new Error(`Unknown move: ${move}`);
    const [, depth, letter, amount] = match;
    const { axis, sign } = sides[letter as keyof typeof sides];

    const clockwise = sign === 1 ? 3 : 1;
    const quarters = amount === "2" ? 2 : amount === "'" ? 4 - clockwise : clockwise;
    const level = sign * (cube.size + 1 - Number(depth || 1) * 2);

    for (const sticker of cube.stickers) {
      if (sticker.spot[axis] !== level) continue;
      for (let i = 0; i < quarters; i++) {
        sticker.spot = quarter(sticker.spot, axis);
        sticker.facing = quarter(sticker.facing, axis);
      }
    }
  }
}

export function makeRandom(seed: string) {
  let state = 2014;
  for (const char of seed) {
    state = (state * 31 * char.charCodeAt(0)) % 2147483647 || 1;
  }
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  }
}
type Random = ReturnType<typeof makeRandom>;

function pick<T>(list: readonly T[], random: Random) {
  return list[Math.floor(random() * list.length)];
}

export function randomMoves(count: number, random: Random, deepest = 1) {
  const moves: string[] = [];
  for (let i = 0; i < count; i++) {
    const depth = 1 + Math.floor(random() * deepest);
    moves.push(`${depth > 1 ? depth : ""}${pick(Object.keys(sides), random)}${pick(["", "'", "2"], random)}`);
  }
  return moves.join(" ");
}

export function buildCube(size: number, stage: Stage, random: Random) {
  const cube = solvedCube(size);
  if (stage === "planned") {
    turn(cube, randomMoves(size * 15, random, Math.floor(size / 2)));
  }
  return cube;
}
