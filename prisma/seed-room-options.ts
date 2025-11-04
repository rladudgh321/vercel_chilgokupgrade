
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roomOptions = [
    { name: '1개', order: 1 },
    { name: '2개', order: 2 },
    { name: '3개', order: 3 },
    { name: '4개', order: 4 },
    { name: '5개 이상', order: 5 },
    { name: '오픈형', order: 6 },
  ];

  for (const option of roomOptions) {
    await prisma.roomOption.upsert({
      where: { name: option.name },
      update: {},
      create: {
        name: option.name,
        order: option.order,
      },
    });
  }
}

main()
  .then(() => {
    console.log('🌱 RoomOption seed completed.');
    return prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ RoomOption seed failed.', e);
    await prisma.$disconnect();
    process.exit(1);
  });
