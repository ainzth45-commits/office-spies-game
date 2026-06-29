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

export function findSpyPartner(roles: Record<PlayerId, Role>, playerId: PlayerId): PlayerId | null {
  const role = roles[playerId];
  if (role !== "spyA" && role !== "spyB") return null;
  const partnerRole: Role = role === "spyA" ? "spyB" : "spyA";
  return Object.entries(roles).find(([, candidateRole]) => candidateRole === partnerRole)?.[0] ?? null;
}
