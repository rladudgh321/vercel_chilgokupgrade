import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, 'build-seed-data.json');

  if (!fs.existsSync(filePath)) {
    throw new Error(`❌ 파일을 찾을 수 없습니다: ${filePath}`);
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  for (const item of data) {
    const { rooms, dealType, propertyType, popularity, label, ...restOfItem } = item;
    let roomOptionId = null;
    let buyTypeId = null;
    let listingTypeId = null;
    let popularityString = null;
    let labelId = null;

    if (rooms) {
      const roomOptionName = `${rooms}개`;
      const roomOption = await prisma.roomOption.findUnique({
        where: { name: roomOptionName },
      });
      if (roomOption) {
        roomOptionId = roomOption.id;
      } else {
        console.warn(`Could not find RoomOption for rooms: ${rooms}`)
      }
    }

    if (dealType) {
      const buyType = await prisma.buyType.findUnique({
        where: { name: dealType },
      });
      if (buyType) {
        buyTypeId = buyType.id;
      } else {
        console.warn(`Could not find BuyType for dealType: ${dealType}`)
      }
    }

    if (propertyType) {
      const listingType = await prisma.listingType.findUnique({
        where: { name: propertyType },
      });
      if (listingType) {
        listingTypeId = listingType.id;
      } else {
        console.warn(`Could not find ListingType for propertyType: ${propertyType}`)
      }
    }

    if (popularity && Array.isArray(popularity)) {
      popularityString = popularity.join(', ');
    }

    if (label) {
      const labelRecord = await prisma.label.findUnique({
        where: { name: label },
      });
      if (labelRecord) {
        labelId = labelRecord.id;
      } else {
        console.warn(`Could not find Label for label: ${label}`)
      }
    }

    await prisma.build.create({
      data: {
        ...restOfItem,
        roomOptionId,
        buyTypeId,
        listingTypeId,
        popularity: popularityString,
        labelId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        constructionYear: new Date(item.constructionYear),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        permitDate: new Date(item.permitDate),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        approvalDate: new Date(item.approvalDate),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        moveInDate: new Date(item.moveInDate),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        contractEndDate: new Date(item.contractEndDate),
      },
    });
  }
}

main()
  .then(() => {
    console.log('🌱 Seed completed.');
    return prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed.', e);
    await prisma.$disconnect();
    process.exit(1);
  });
