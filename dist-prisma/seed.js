"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = path.join(__dirname, 'build-seed-data.json');
        if (!fs.existsSync(filePath)) {
            throw new Error(`❌ 파일을 찾을 수 없습니다: ${filePath}`);
        }
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        for (const item of data) {
            const { rooms, dealType, propertyType, popularity } = item, restOfItem = __rest(item, ["rooms", "dealType", "propertyType", "popularity"]);
            let roomOptionId = null;
            let buyTypeId = null;
            let listingTypeId = null;
            let popularityString = null;
            if (rooms) {
                const roomOptionName = `${rooms}개`;
                const roomOption = yield prisma.roomOption.findUnique({
                    where: { name: roomOptionName },
                });
                if (roomOption) {
                    roomOptionId = roomOption.id;
                }
                else {
                    console.warn(`Could not find RoomOption for rooms: ${rooms}`);
                }
            }
            if (dealType) {
                const buyType = yield prisma.buyType.findUnique({
                    where: { name: dealType },
                });
                if (buyType) {
                    buyTypeId = buyType.id;
                }
                else {
                    console.warn(`Could not find BuyType for dealType: ${dealType}`);
                }
            }
            if (propertyType) {
                const listingType = yield prisma.listingType.findUnique({
                    where: { name: propertyType },
                });
                if (listingType) {
                    listingTypeId = listingType.id;
                }
                else {
                    console.warn(`Could not find ListingType for propertyType: ${propertyType}`);
                }
            }
            if (popularity && Array.isArray(popularity)) {
                popularityString = popularity.join(', ');
            }
            yield prisma.build.create({
                data: Object.assign(Object.assign({}, restOfItem), { roomOptionId,
                    buyTypeId,
                    listingTypeId, popularity: popularityString, 
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    constructionYear: new Date(item.constructionYear), 
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    permitDate: new Date(item.permitDate), 
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    approvalDate: new Date(item.approvalDate), 
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    moveInDate: new Date(item.moveInDate), 
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    contractEndDate: new Date(item.contractEndDate) }),
            });
        }
    });
}
main()
    .then(() => {
    console.log('🌱 Seed completed.');
    return prisma.$disconnect();
})
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error('❌ Seed failed.', e);
    yield prisma.$disconnect();
    process.exit(1);
}));
