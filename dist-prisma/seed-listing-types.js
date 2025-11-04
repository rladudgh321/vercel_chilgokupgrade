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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const listingTypes = [
            { name: '아파트', order: 1 },
            { name: '빌라', order: 2 },
            { name: '토지', order: 3 },
            { name: '상가', order: 4 },
            { name: '사무실', order: 5 },
        ];
        for (const type of listingTypes) {
            yield prisma.listingType.upsert({
                where: { name: type.name },
                update: {},
                create: {
                    name: type.name,
                    order: type.order,
                },
            });
        }
    });
}
main()
    .then(() => {
    console.log('🌱 ListingType seed completed.');
    return prisma.$disconnect();
})
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error('❌ ListingType seed failed.', e);
    yield prisma.$disconnect();
    process.exit(1);
}));
