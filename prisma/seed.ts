import { PrismaClient, PopupType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // 1. WorkInfo (단일 레코드)
  await prisma.workInfo.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      companyName: '칠곡부동산',
      phone: '054-977-1234',
      mobile: '010-1234-5678',
      email: 'chilgok@example.com',
      owner: '홍길동',
      businessId: '123-45-67890',
      address: '경상북도 칠곡군 왜관읍 중앙로 123',
      logoUrl: '/logo.png',
      logoName: '칠곡부동산 로고',
    },
  });
  console.log('✅ Seeded WorkInfo.');

  // 2. Basic Options
  const listingTypes = await Promise.all([
    prisma.listingType.upsert({ where: { name: '아파트' }, update: {}, create: { name: '아파트', order: 1 } }),
    prisma.listingType.upsert({ where: { name: '오피스텔' }, update: {}, create: { name: '오피스텔', order: 2 } }),
    prisma.listingType.upsert({ where: { name: '원룸' }, update: {}, create: { name: '원룸', order: 3 } }),
    prisma.listingType.upsert({ where: { name: '상가' }, update: {}, create: { name: '상가', order: 4 } }),
    prisma.listingType.upsert({ where: { name: '토지' }, update: {}, create: { name: '토지', order: 5 } }),
  ]);
  console.log('✅ Seeded ListingTypes.');

  const buyTypes = await Promise.all([
    prisma.buyType.upsert({ where: { name: '매매' }, update: {}, create: { name: '매매', order: 1 } }),
    prisma.buyType.upsert({ where: { name: '전세' }, update: {}, create: { name: '전세', order: 2 } }),
    prisma.buyType.upsert({ where: { name: '월세' }, update: {}, create: { name: '월세', order: 3 } }),
  ]);
  console.log('✅ Seeded BuyTypes.');

  const roomOptions = await Promise.all([
    prisma.roomOption.upsert({ where: { name: '1개' }, update: {}, create: { name: '1개', order: 1 } }),
    prisma.roomOption.upsert({ where: { name: '2개' }, update: {}, create: { name: '2개', order: 2 } }),
    prisma.roomOption.upsert({ where: { name: '3개' }, update: {}, create: { name: '3개', order: 3 } }),
  ]);
  console.log('✅ Seeded RoomOptions.');

  const bathroomOptions = await Promise.all([
    prisma.bathroomOption.upsert({ where: { name: '1개' }, update: {}, create: { name: '1개', order: 1 } }),
    prisma.bathroomOption.upsert({ where: { name: '2개' }, update: {}, create: { name: '2개', order: 2 } }),
  ]);
  console.log('✅ Seeded BathroomOptions.');

  const labels = await Promise.all([
    prisma.label.upsert({ where: { name: '추천' }, update: {}, create: { name: '추천', order: 1 } }),
    prisma.label.upsert({ where: { name: '급매' }, update: {}, create: { name: '급매', order: 2 } }),
  ]);
  console.log('✅ Seeded Labels.');

  // 3. Build (매물)
  const buildData = [
    { address: '경상북도 칠곡군 왜관읍 중앙로 100', propertyType: listingTypes[0].name, listingTypeId: listingTypes[0].id, buyType: buyTypes[0].name, buyTypeId: buyTypes[0].id, salePrice: 300000000, isSalePriceEnabled: true, title: '아파트 급매! 역세권', editorContent: '역세권 아파트, 생활 편의시설 인접', roomOptionId: roomOptions[1].id, bathroomOptionId: bathroomOptions[0].id, totalArea: 84.5, supplyArea: 70, actualArea: 60, currentFloor: 5, totalFloors: 15, direction: '남향', isAddressPublic: 'public', visibility: true, labelId: labels[1].id },
    { address: '경상북도 칠곡군 왜관읍 평화로 200', propertyType: listingTypes[1].name, listingTypeId: listingTypes[1].id, buyType: buyTypes[2].name, buyTypeId: buyTypes[2].id, deposit: 10000000, isDepositEnabled: true, rentalPrice: 500000, isRentalPriceEnabled: true, managementFee: 50000, isManagementFeeEnabled: true, title: '신축 오피스텔 월세', editorContent: '풀옵션 신축 오피스텔, 즉시 입주 가능', roomOptionId: roomOptions[0].id, bathroomOptionId: bathroomOptions[0].id, totalArea: 30, supplyArea: 25, actualArea: 20, currentFloor: 8, totalFloors: 10, direction: '동향', isAddressPublic: 'public', visibility: true, labelId: labels[0].id },
    { address: '경상북도 칠곡군 왜관읍 중앙로 300', propertyType: listingTypes[0].name, listingTypeId: listingTypes[0].id, buyType: buyTypes[1].name, buyTypeId: buyTypes[1].id, lumpSumPrice: 200000000, isLumpSumPriceEnabled: true, title: '역세권 아파트 전세', editorContent: '교통 편리, 조용한 주거 환경', roomOptionId: roomOptions[2].id, bathroomOptionId: bathroomOptions[1].id, totalArea: 100, supplyArea: 80, actualArea: 70, currentFloor: 12, totalFloors: 20, direction: '남향', isAddressPublic: 'public', visibility: true },
    { address: '경상북도 칠곡군 왜관읍 시장길 50', propertyType: listingTypes[3].name, listingTypeId: listingTypes[3].id, buyType: buyTypes[0].name, buyTypeId: buyTypes[0].id, salePrice: 500000000, isSalePriceEnabled: true, title: '시장통 상가 매매', editorContent: '유동인구 많음, 권리금 없음', totalArea: 50, supplyArea: 40, actualArea: 35, currentFloor: 1, totalFloors: 3, direction: '북향', isAddressPublic: 'public', visibility: true },
    { address: '경상북도 칠곡군 왜관읍 강변로 10', propertyType: listingTypes[4].name, listingTypeId: listingTypes[4].id, buyType: buyTypes[0].name, buyTypeId: buyTypes[0].id, salePrice: 150000000, isSalePriceEnabled: true, title: '강변 토지 매매', editorContent: '전원주택 부지 적합, 조망 좋음', landArea: 300, isAddressPublic: 'public', visibility: true },
  ];

  for (const item of buildData) {
    const { listingTypeId, buyTypeId, roomOptionId, bathroomOptionId, labelId, ...restOfData } = item;
    await prisma.build.create({
      data: {
        ...restOfData,
        listingType: listingTypeId ? { connect: { id: listingTypeId } } : undefined,
        buyType: buyTypeId ? { connect: { id: buyTypeId } } : undefined,
        roomOption: roomOptionId ? { connect: { id: roomOptionId } } : undefined,
        bathroomOption: bathroomOptionId ? { connect: { id: bathroomOptionId } } : undefined,
        label: labelId ? { connect: { id: labelId } } : undefined,
      },
    });
  }
  console.log('✅ Seeded Build records.');

  // 4. Board & Posts
  const categories = await Promise.all([
    prisma.boardCategory.upsert({ where: { name: '공지사항' }, update: {}, create: { name: '공지사항', order: 1 } }),
    prisma.boardCategory.upsert({ where: { name: '자주 묻는 질문' }, update: {}, create: { name: '자주 묻는 질문', order: 2 } }),
  ]);
  console.log('✅ Seeded BoardCategories.');

  await prisma.boardPost.create({
    data: { title: '첫 공지사항입니다.', content: '칠곡 부동산에 오신 것을 환영합니다.', categoryId: categories[0].id, isAnnouncement: true }
  });
  await prisma.boardPost.create({
    data: { title: '전세자금대출은 어떻게 받나요?', content: '은행에 문의하세요.', categoryId: categories[1].id, popupType: PopupType.CONTENT }
  });
  console.log('✅ Seeded BoardPosts.');

  // 5. Other Config Tables
  await prisma.themeImage.create({ data: { label: '기본 테마', imageUrl: '/img/main.png', imageName: 'main.png' } });
  console.log('✅ Seeded ThemeImages.');

  await prisma.buildingOption.upsert({ where: { name: '주차가능' }, update: {}, create: { name: '주차가능', order: 1 } });
  await prisma.buildingOption.upsert({ where: { name: '엘리베이터' }, update: {}, create: { name: '엘리베이터', order: 2 } });
  console.log('✅ Seeded BuildingOptions.');

  await prisma.pricePreset.create({ data: { name: '매매 1억 이하', buyTypeId: buyTypes.find(b => b.name === '매매')!.id, order: 1 } });
  console.log('✅ Seeded PricePresets.');

  await prisma.floorOption.upsert({ where: { name: '1층' }, update: {}, create: { name: '1층', order: 1 } });
  await prisma.floorOption.upsert({ where: { name: '2층~5층' }, update: {}, create: { name: '2층~5층', order: 2 } });
  console.log('✅ Seeded FloorOptions.');

  await prisma.areaPreset.upsert({ where: { name: '20평 이하' }, update: {}, create: { name: '20평 이하', order: 1 } });
  console.log('✅ Seeded AreaPresets.');

  await prisma.searchBarSetting.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  console.log('✅ Seeded SearchBarSetting.');

  await prisma.snsSetting.upsert({ where: { name: '블로그' }, update: {}, create: { name: '블로그', url: 'https://blog.naver.com/example' } });
  await prisma.snsSetting.upsert({ where: { name: '유튜브' }, update: {}, create: { name: '유튜브', url: 'https://youtube.com/example' } });
  console.log('✅ Seeded SnsSettings.');

  await prisma.webViewBanner.upsert({ where: { id: 1 }, update: {}, create: { id: 1, imageUrl: '/img/main.png', imageName: 'main.png' } });
  console.log('✅ Seeded WebViewBanners.');

  // 6. Example Data
  await prisma.bannedIp.upsert({ where: { ipAddress: '192.168.1.1' }, update: {}, create: { ipAddress: '192.168.1.1', reason: '테스트' } });
  console.log('✅ Seeded BannedIps.');

  await prisma.order.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      category: '매물 의뢰',
      transactionType: '매매',
      author: '김철수',
      propertyType: '아파트',
      estimatedAmount: '3억',
      contact: '010-0000-0000',
      ipAddress: '127.0.0.1',
      region: '경상북도 칠곡군',
      title: '아파트 팔아주세요',
      description: '빨리 팔아주세요.',
    }
  });
  console.log('✅ Seeded Orders.');

  console.log('🚀 Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });