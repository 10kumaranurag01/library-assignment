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
exports.returnBook = exports.issueBook = exports.getBooksIssuedInDateRange = exports.getBooksIssuedToUserByName = exports.getTotalRentByBookName = exports.getBookIssuanceDetailsByName = void 0;
const bookModel_1 = __importDefault(require("../models/bookModel"));
const transactionModel_1 = __importDefault(require("../models/transactionModel"));
const getBookIssuanceDetailsByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.params;
    try {
        const books = yield bookModel_1.default.find({ name: { $regex: name, $options: "i" } });
        const bookIds = books.map((book) => book._id);
        if (bookIds.length === 0) {
            res
                .status(404)
                .json({ message: "No books found with the given name or term" });
            return;
        }
        const transactions = yield transactionModel_1.default.find({
            bookId: { $in: bookIds },
        }).populate("userId");
        const currentlyIssued = yield transactionModel_1.default.findOne({
            bookId: { $in: bookIds },
            returnDate: null,
        }).populate("userId");
        const pastIssuers = transactions
            .filter((t) => t.returnDate !== null)
            .map((t) => t.userId);
        const totalCount = transactions.length;
        const currentIssuer = currentlyIssued
            ? currentlyIssued.userId
            : "Not currently issued";
        res.json({
            totalCount,
            pastIssuers,
            currentlyIssuedTo: currentIssuer,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get issuance details" });
    }
});
exports.getBookIssuanceDetailsByName = getBookIssuanceDetailsByName;
const getTotalRentByBookName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.params;
    try {
        const books = yield bookModel_1.default.find({ name: { $regex: name, $options: "i" } });
        const bookIds = books.map((book) => book._id);
        if (bookIds.length === 0) {
            res
                .status(404)
                .json({ message: "No books found with the given name or term" });
            return;
        }
        const transactions = yield transactionModel_1.default.find({ bookId: { $in: bookIds } });
        const totalRent = transactions.reduce((acc, transaction) => acc + (transaction.totalRent || 0), 0);
        res.json({ totalRent });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to calculate total rent" });
        return;
    }
});
exports.getTotalRentByBookName = getTotalRentByBookName;
const userModel_1 = __importDefault(require("../models/userModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const getBooksIssuedToUserByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userIdOrName } = req.params;
    try {
        const isObjectId = mongoose_1.default.Types.ObjectId.isValid(userIdOrName);
        const user = yield userModel_1.default.findOne(isObjectId
            ? { _id: userIdOrName }
            : { name: { $regex: userIdOrName, $options: "i" } });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const transactions = yield transactionModel_1.default.find({ userId: user._id }).populate("bookId");
        const booksIssued = transactions.map((t) => t.bookId);
        res.json(booksIssued);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get books issued to user" });
    }
});
exports.getBooksIssuedToUserByName = getBooksIssuedToUserByName;
const getBooksIssuedInDateRange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate } = req.query;
    try {
        const transactions = yield transactionModel_1.default.find({
            issueDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
        }).populate("bookId userId");
        const issuedBooks = transactions.map((t) => ({
            book: t.bookId,
            issuedTo: t.userId,
        }));
        res.json(issuedBooks);
        return;
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Failed to get books issued in the date range" });
        return;
    }
});
exports.getBooksIssuedInDateRange = getBooksIssuedInDateRange;
const issueBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookName, userId, issueDate } = req.body;
    const book = yield bookModel_1.default.findOne({ name: bookName });
    if (!book) {
        res.status(404).json({ error: "Book not found" });
        return;
    }
    const user = yield userModel_1.default.findById(userId);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    const activeTransaction = yield transactionModel_1.default.findOne({
        bookId: book._id,
        returnDate: null,
    });
    if (activeTransaction) {
        res
            .status(400)
            .json({ error: "Book is already issued and not yet returned" });
        return;
    }
    const transaction = new transactionModel_1.default({
        bookId: book._id,
        userId,
        issueDate,
        returnDate: null,
        totalRent: 0,
    });
    yield transaction.save();
    res.status(201).json(transaction);
});
exports.issueBook = issueBook;
const returnBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookName, userId, returnDate } = req.body;
    const book = yield bookModel_1.default.findOne({ name: bookName });
    if (!book) {
        res.status(404).json({ error: "Book not found" });
        return;
    }
    const user = yield userModel_1.default.findById(userId);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    const transaction = yield transactionModel_1.default.findOne({
        bookId: book._id,
        userId,
        returnDate: null,
    });
    if (!transaction) {
        res.status(404).json({ error: "No active transaction found." });
        return;
    }
    const daysRented = (new Date(returnDate).getTime() -
        new Date(transaction.issueDate).getTime()) /
        (1000 * 3600 * 24);
    transaction.returnDate = returnDate;
    transaction.totalRent = daysRented * book.rentPerDay;
    yield transaction.save();
    res.json(transaction);
});
exports.returnBook = returnBook;
