"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookQuerySchema = void 0;
const zod_1 = require("zod");
exports.bookQuerySchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    rentMin: zod_1.z.number().optional(),
    rentMax: zod_1.z.number().optional(),
    category: zod_1.z.string().optional(),
});
