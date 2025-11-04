
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const labels = [
    { name: '전세자금', order: 1 },
    { name: '급매', order: 2 },
    { name: '인기매물', order: 3 },
  ];

  for (const label of labels) {
    await prisma.label.upsert({
      where: { name: label.name },
      update: {},
      create: {
        name: label.name,
        order: label.order,
      },
    });
  }
}

main()
  .then(() => {
    console.log('🌱 Label seed completed.');
    return prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Label seed failed.', e);
    await prisma.$disconnect();
    process.exit(1);
  });
