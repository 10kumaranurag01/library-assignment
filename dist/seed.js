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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const userModel_1 = __importDefault(require("./models/userModel"));
const bookModel_1 = __importDefault(require("./models/bookModel"));
dotenv_1.default.config();
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    throw new Error("MONGODB_URI is not defined in the environment variables.");
}
const generateRandomUsers = (num) => {
    const users = [];
    for (let i = 0; i < num; i++) {
        users.push({
            name: `User${i + 1}`,
            email: `user${i + 1}@example.com`,
        });
    }
    return users;
};
const generateRandomBooks = (num) => {
    const categories = [
        "Fiction",
        "Non-Fiction",
        "Science",
        "Fantasy",
        "History",
    ];
    const books = [];
    for (let i = 0; i < num; i++) {
        books.push({
            name: `Book${i + 1}`,
            category: categories[Math.floor(Math.random() * categories.length)],
            rentPerDay: Math.floor(Math.random() * 10) + 1, // Random rent between 1 and 10
        });
    }
    return books;
};
const seedDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(mongoURI);
        console.log("Connected to MongoDB");
        const users = generateRandomUsers(5);
        yield userModel_1.default.insertMany(users);
        console.log("Inserted 5 random users");
        const books = generateRandomBooks(20);
        yield bookModel_1.default.insertMany(books);
        console.log("Inserted 20 random books");
        yield mongoose_1.default.connection.close();
        console.log("Database seeding complete");
    }
    catch (error) {
        console.error("Error seeding database:", error);
    }
});
seedDatabase();
