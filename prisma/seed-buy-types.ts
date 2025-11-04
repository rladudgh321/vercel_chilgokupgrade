
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const buyTypes = [
    { name: '매매', order: 1 },
    { name: '전세', order: 2 },
    { name: '월세', order: 3 },
  ];

  for (const type of buyTypes) {
    await prisma.buyType.upsert({
      where: { name: type.name },
      update: {},
      create: {
        name: type.name,
        order: type.order,
      },
    });
  }
}

main()
  .then(() => {
    console.log('🌱 BuyType seed completed.');
    return prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ BuyType seed failed.', e);
    await prisma.$disconnect();
    process.exit(1);
  });
