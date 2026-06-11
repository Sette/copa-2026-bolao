/**
 * Calcula pontos de um palpite baseado no placar real.
 *
 * Regras:
 * - Placar exato: 5 pontos
 * - Acertou vencedor ou empate (direção do resultado): 3 pontos
 * - Errou: 0 pontos
 */
export function calculatePoints(
  betHome: number,
  betAway: number,
  actualHome: number,
  actualAway: number
): { points: number; result: "exact" | "winner" | "loss" } {
  // Placar exato
  if (betHome === actualHome && betAway === actualAway) {
    return { points: 5, result: "exact" };
  }

  const betDir = Math.sign(betHome - betAway);
  const actualDir = Math.sign(actualHome - actualAway);

  // Mesmo sinal = mesma direção do resultado (vitória/empate)
  if (betDir === actualDir) {
    return { points: 3, result: "winner" };
  }

  return { points: 0, result: "loss" };
}
