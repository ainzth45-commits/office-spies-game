import type { PlayerId, Role } from "./types";
import { type RandomSource, shuffle } from "./random";

export function assignSpyRoles(playerIds: PlayerId[], random: RandomSource = Math.random): Record<PlayerId, Role> {
  if (playerIds.length < 2) {
    throw new Error("At least two players are required to assign spies");
  }

  const [spyA, spyB] = shuffle(playerIds, random);

  return Object.fromEntries(
    playerIds.map((playerId) => {
      if (playerId === spyA) return [playerId, "spyA"];
      if (playerId === spyB) return [playerId, "spyB"];
      return [playerId, "normal"];
    }),
  );
}

// เลื่อน 1 คน (ที่ยังเป็น normal และอยู่ในกลุ่มมีสิทธิ์) ให้เป็น "พนักงานสติแตก"
// eligibleIds = คนที่มาวันแรก (ชุดเดียวกับที่ใช้สุ่มสปาย) — คนลาไม่มีวันเป็น jester
export function promoteJester(
  roles: Record<PlayerId, Role>,
  eligibleIds: PlayerId[],
  random: RandomSource = Math.random,
): Record<PlayerId, Role> {
  const normals = eligibleIds.filter((id) => roles[id] === "normal");
  if (normals.length === 0) return roles; // ไม่มี normal เหลือให้เป็น jester (คนน้อยเกิน) — ปล่อยไว้
  const [jesterId] = shuffle(normals, random);
  return { ...roles, [jesterId]: "jester" };
}

export function findSpyPartner(roles: Record<PlayerId, Role>, playerId: PlayerId): PlayerId | null {
  const role = roles[playerId];
  if (role !== "spyA" && role !== "spyB") return null;
  const partnerRole: Role = role === "spyA" ? "spyB" : "spyA";
  return Object.entries(roles).find(([, candidateRole]) => candidateRole === partnerRole)?.[0] ?? null;
}
