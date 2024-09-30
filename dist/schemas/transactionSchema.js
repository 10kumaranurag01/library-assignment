"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnBookSchema = exports.issueBookSchema = void 0;
const zod_1 = require("zod");
exports.issueBookSchema = zod_1.z.object({
    bookName: zod_1.z.string().min(1, "Book Name is required"),
    userId: zod_1.z.string().min(1, "User ID is required"),
    issueDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid Issue Date format",
    }),
});
exports.returnBookSchema = zod_1.z.object({
    bookName: zod_1.z.string().min(1, "Book Name is required"),
    userId: zod_1.z.string().min(1, "User ID is required"),
    returnDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid Return Date format",
    }),
});
