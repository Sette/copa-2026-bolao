import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

// Copa do Mundo 2026: 48 times, 12 grupos (A-L) de 4 times
const GROUPS: { name: string; teams: string[] }[] = [
  { name: "A", teams: ["Canadá", "México", "Japão", "Sérvia"] },
  { name: "B", teams: ["Brasil", "Alemanha", "Nigéria", "Irã"] },
  { name: "C", teams: ["Argentina", "França", "Coréia do Sul", "Costa Rica"] },
  { name: "D", teams: ["Inglaterra", "Espanha", "Egito", "Austrália"] },
  { name: "E", teams: ["Estados Unidos", "Itália", "Senegal", "China"] },
  { name: "F", teams: ["Portugal", "Uruguai", "Marrocos", "Canadá"] },
  { name: "G", teams: ["Holanda", "Bélgica", "Gana", "Arábia Saudita"] },
  { name: "H", teams: ["Croácia", "Colômbia", "Camarões", "Nova Zelândia"] },
  { name: "I", teams: ["Chile", "Dinamarca", "Tunísia", "Emirados Árabes"] },
  { name: "J", teams: ["Suíça", "Suécia", "Paraguai", "Catar"] },
  { name: "K", teams: ["Polônia", "Noruega", "África do Sul", "Peru"] },
  { name: "L", teams: ["Ucrânia", "Áustria", "Equador", "Mali"] },
];

function generateGroupMatches() {
  let matchNumber = 1;
  const matches: Array<{
    homeTeam: string;
    awayTeam: string;
    groupName: string;
    round: number;
    matchNumber: number;
    date: Date;
    location: string;
  }> = [];

  // Copa 2026: 11 Jun - 19 Jul 2026
  const baseDate = new Date("2026-06-11T14:00:00-03:00");

  GROUPS.forEach((group, groupIdx) => {
    const [t1, t2, t3, t4] = group.teams;
    // Round-robin: 6 matches per group
    const pairings = [
      [t1, t2],
      [t3, t4],
      [t1, t3],
      [t2, t4],
      [t1, t4],
      [t2, t3],
    ];

    pairings.forEach(([home, away], pairIdx) => {
      // Spread group matches over the first 12 days
      const dayOffset = Math.floor(matchNumber / 4); // ~4 matches per day
      const hourOffset = (matchNumber % 4) * 3; // stagger by 3 hours
      const matchDate = new Date(baseDate);
      matchDate.setDate(matchDate.getDate() + dayOffset);
      matchDate.setHours(matchDate.getHours() + hourOffset);

      matches.push({
        homeTeam: home,
        awayTeam: away,
        groupName: group.name,
        round: 1, // Group stage
        matchNumber: matchNumber,
        date: matchDate,
        location: `Estádio ${matchNumber}`,
      });

      matchNumber++;
    });
  });

  return matches;
}

function generateKnockoutMatches(startMatchNumber: number) {
  const matches: Array<{
    homeTeam: string;
    awayTeam: string;
    groupName: string;
    round: number;
    matchNumber: number;
    date: Date;
    location: string;
  }> = [];

  const baseDate = new Date("2026-06-29T14:00:00-03:00");

  const rounds = [
    { round: 2, name: "16-avos", count: 16, label: "Round of 32" },
    { round: 3, name: "Oitavas", count: 8, label: "Round of 16" },
    { round: 4, name: "Quartas", count: 4, label: "Quarter-finals" },
    { round: 5, name: "Semi", count: 2, label: "Semi-finals" },
    { round: 6, name: "3º Lugar", count: 1, label: "Third Place" },
    { round: 7, name: "Final", count: 1, label: "Final" },
  ];

  let matchNum = startMatchNumber;
  let dayOffset = 0;

  rounds.forEach(({ round, name, count }) => {
    for (let i = 0; i < count; i++) {
      const matchDate = new Date(baseDate);
      matchDate.setDate(matchDate.getDate() + dayOffset);
      matchDate.setHours(matchDate.getHours() + (i % 2) * 4);

      matches.push({
        homeTeam: `Vencedor J${matchNum}`,
        awayTeam: `Vencedor J${matchNum + 1}`,
        groupName: name,
        round,
        matchNumber: matchNum,
        date: matchDate,
        location: `Estádio ${matchNum}`,
      });

      matchNum++;
      if (i % 2 === 1) dayOffset++;
    }
    dayOffset += 1; // Extra rest day between rounds
  });

  return matches;
}

async function main() {
  console.log("🌱 Iniciando seed...");

  // Clean existing data
  await prisma.bet.deleteMany();
  await prisma.bolaoMember.deleteMany();
  await prisma.bolao.deleteMany();
  await prisma.match.deleteMany();

  // Generate matches
  const groupMatches = generateGroupMatches();
  const knockoutMatches = generateKnockoutMatches(groupMatches.length + 1);
  const allMatches = [...groupMatches, ...knockoutMatches];

  console.log(`⚽ Criando ${allMatches.length} partidas...`);
  await prisma.match.createMany({ data: allMatches });

  console.log("✅ Seed concluído!");
  console.log(`   - ${groupMatches.length} jogos da fase de grupos`);
  console.log(`   - ${knockoutMatches.length} jogos de mata-mata`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
