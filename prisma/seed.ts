import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("--- 🚀 SEEDING STABLE (Prisma 6) ---");

  await prisma.portfolioItem.deleteMany();
  await prisma.portfolioItem.createMany({
    data: [
      { coinId: "bitcoin", amount: 0.5, buyPrice: 60000 },
      { coinId: "ethereum", amount: 5, buyPrice: 2000 },
      { coinId: "solana", amount: 50, buyPrice: 100 },
    ],
  });

  console.log("--- ✅ SUCCESS: DATABASE READY! ---");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
