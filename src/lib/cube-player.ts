import { place, readMove, turn, type Cube } from "./cube";

const rotations = ["rotateX", "rotateY", "rotateZ"];
const directions = [-1, 1, -1];

export function tilesOf(scene: Element) {
  return [...scene.querySelectorAll<HTMLElement>(".tile")];
}

export function show(tiles: HTMLElement[], cube: Cube, which = cube.stickers.map((_, i) => i)) {
  for (const i of which) {
    const { face, transform, corner } = place(cube.stickers[i], cube.size);
    tiles[i].style.transform = transform;
    tiles[i].dataset.face = face;
    tiles[i].dataset.corner = corner;
  }
}

const caps = ["rotateY(90deg)", "rotateX(90deg)", "rotateY(0deg)"];

function addCap(cube: HTMLElement, axis: number, cut: number) {
  const cap = document.createElement("span");
  cap.className = "cap";
  cap.style.transform = `${caps[axis]} translateZ(calc(var(--cell) * ${cut}))`;
  cube.append(cap);
  return cap;
}

export async function animateTurn(tiles: HTMLElement[], cube: Cube, move: string, ms: number) {
  const { axis, levels, quarters } = readMove(move, cube.size);
  const angle = (quarters === 3 ? -1 : quarters) * 90 * directions[axis];
  const rotate = rotations[axis];
  const box = tiles[0].parentElement!;

  const cuts: number[] = [];
  for (const level of levels) {
    for (const next of [level - 2, level + 2]) {
      if (Math.abs(next) < cube.size && !levels.includes(next)) cuts.push((level + next) / 4);
    }
  }
  const still = cuts.map((cut) => addCap(box, axis, cut));
  const turning = cuts.map((cut) => addCap(box, axis, cut));
  box.classList.add("turning");

  const moving = cube.stickers.flatMap((sticker, i) => (levels.includes(sticker.spot[axis]) ? [i] : []));
  const animations = [...moving.map((i) => tiles[i]), ...turning].map((element) => {
    const start = getComputedStyle(element).transform;
    return element.animate(
      [{ transform: `${rotate}(0deg) ${start}` }, { transform: `${rotate}(${angle}deg) ${start}` }],
      { duration: ms, easing: "ease-in-out", fill: "forwards" },
    );
  });

  await Promise.all(animations.map((animation) => animation.finished));
  turn(cube, move);
  show(tiles, cube, moving);
  animations.forEach((animation) => animation.cancel());
  [...still, ...turning].forEach((cap) => cap.remove());
  box.classList.remove("turning");
}
