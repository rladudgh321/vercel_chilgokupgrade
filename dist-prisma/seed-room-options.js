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
        const roomOptions = [
            { name: '1개', order: 1 },
            { name: '2개', order: 2 },
            { name: '3개', order: 3 },
            { name: '4개', order: 4 },
            { name: '5개 이상', order: 5 },
            { name: '오픈형', order: 6 },
        ];
        for (const option of roomOptions) {
            yield prisma.roomOption.upsert({
                where: { name: option.name },
                update: {},
                create: {
                    name: option.name,
                    order: option.order,
                },
            });
        }
    });
}
main()
    .then(() => {
    console.log('🌱 RoomOption seed completed.');
    return prisma.$disconnect();
})
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error('❌ RoomOption seed failed.', e);
    yield prisma.$disconnect();
    process.exit(1);
}));
