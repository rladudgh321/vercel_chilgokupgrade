
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const listingTypes = [
    { name: '아파트', order: 1 },
    { name: '빌라', order: 2 },
    { name: '토지', order: 3 },
    { name: '상가', order: 4 },
    { name: '사무실', order: 5 },
  ];

  for (const type of listingTypes) {
    await prisma.listingType.upsert({
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
    console.log('🌱 ListingType seed completed.');
    return prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ ListingType seed failed.', e);
    await prisma.$disconnect();
    process.exit(1);
  });
