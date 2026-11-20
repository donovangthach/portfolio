import type { Stage } from "./stages";

export const colors = {
  top: "#e5e7eb",
  front: "#22c55e",
  right: "#ef4444",
  back: "#3b82f6",
  left: "#f97316",
  bottom: "#facc15",
};
export type Face = keyof typeof colors;
export const faceNames = Object.keys(colors) as Face[];

type Vec = [number, number, number];
type Sticker = { spot: Vec; facing: Vec; color: string };
export type Cube = { size: number; stickers: Sticker[] };

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

export function solvedCube(size: number): Cube {
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

export function readMove(move: string, size: number) {
  const match = move.match(/^(\d?)([RLUDFB])(['2]?)$/);
  if (!match) throw new Error(`Unknown move: ${move}`);
  const [, depth, letter, amount] = match;
  const { axis, sign } = sides[letter as keyof typeof sides];

  const clockwise = sign === 1 ? 3 : 1;
  const quarters = amount === "2" ? 2 : amount === "'" ? 4 - clockwise : clockwise;
  const levels = [sign * (size + 1 - Number(depth || 1) * 2)];
  return { axis, levels, quarters };
}

export function turn(cube: Cube, moves: string) {
  for (const move of moves.split(" ").filter(Boolean)) {
    const { axis, levels, quarters } = readMove(move, cube.size);
    for (const sticker of cube.stickers) {
      if (!levels.includes(sticker.spot[axis])) continue;
      for (let i = 0; i < quarters; i++) {
        sticker.spot = quarter(sticker.spot, axis);
        sticker.facing = quarter(sticker.facing, axis);
      }
    }
  }
}

const tilts: Record<Face, string> = {
  top: "rotateX(90deg)",
  front: "rotateY(0deg)",
  right: "rotateY(90deg)",
  back: "rotateY(180deg)",
  left: "rotateY(-90deg)",
  bottom: "rotateX(-90deg)",
};

const tileAxes: Record<Face, [Vec, Vec]> = {
  top: [[1, 0, 0], [0, 0, 1]],
  front: [[1, 0, 0], [0, -1, 0]],
  right: [[0, 0, -1], [0, -1, 0]],
  back: [[-1, 0, 0], [0, -1, 0]],
  left: [[0, 0, 1], [0, -1, 0]],
  bottom: [[1, 0, 0], [0, 0, -1]],
};

const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export function place(sticker: Sticker, size: number) {
  const face = faceNames.find((name) => String(facings[name]) === String(sticker.facing))!;
  const [x, y, z] = sticker.spot;
  const move = (n: number) => `calc(var(--cell) * ${n / 2})`;
  const transform = `translate3d(${move(x)}, ${move(-y)}, ${move(z)}) ${tilts[face]} translateZ(calc(var(--cell) / 2))`;

  const [right, down] = tileAxes[face];
  const across = dot(sticker.spot, right);
  const along = dot(sticker.spot, down);
  const edge = size - 1;
  const corner = Math.abs(across) === edge && Math.abs(along) === edge ? `${along > 0 ? "bottom" : "top"}-${across > 0 ? "right" : "left"}` : "";

  return { face, transform, corner };
}

export function makeRandom(seed: string) {
  let state = 2014;
  for (const char of seed) {
    state = (state * 31 + char.charCodeAt(0)) % 2147483647 || 1;
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

const sideTurns = ["R", "L", "F", "B"];
const topTurns = ["U", "U'", "U2"];

const lastLayerAlgs = [
  "R U R' U R U2 R'",
  "F R U R' U' F'",
];

const swapAlgs = [
  "R U R' U' R' F R2 U' R' U' R U R' F'",
  "R U' R U R U R U' R' U' R2",
  "R U R' F' R U R' U' R' F R2 U' R' U'",
];

function topMixed(cube: Cube) {
  const last = cube.size - 1;
  const top = readFaces(cube).find(({ name }) => name === "top")!.stickers;
  const noWhite = ([row, col]: number[]) => top[row * cube.size + col] !== colors.top;
  const corners = [[0, 0], [0, last], [last, 0], [last, last]].filter(noWhite).length;
  const edges = [[0, 1], [last, 1], [1, 0], [1, last]].filter(noWhite).length;
  return corners >= 2 && edges >= 2;
}

function topRowsSolved(cube: Cube) {
  return readFaces(cube).every(({ name, stickers }) => {
    if (name === "bottom") return true;
    const row = name === "top" ? stickers : stickers.slice(0, cube.size);
    return row.every((color) => color === row[0]);
  });
}

export function buildCube(size: number, stage: Stage, random: Random) {
  const cube = solvedCube(size);

  if (stage === "planned") {
    turn(cube, randomMoves(size * 15, random, Math.floor(size / 2)));
  } else if (stage === "cross" && size > 2) {
    for (let i = 0; i < 20; i++) {
      const side = pick(sideTurns, random);
      turn(cube, `${side} ${pick(topTurns, random)} ${side}'`);
    }
  } else if (stage === "cross" || stage === "f2l") {
    while (!topMixed(cube)) {
      for (let i = 0; i < 6; i++) {
        turn(cube, `${pick(topTurns, random)} ${pick([...lastLayerAlgs, ...swapAlgs], random)}`);
      }
    }
  } else if (stage === "oll") {
    while (topRowsSolved(cube)) {
      for (let i = 0; i < 3; i++) {
        turn(cube, `${pick(topTurns, random)} ${pick(swapAlgs, random)}`);
      }
    }
  }

  return cube;
}
