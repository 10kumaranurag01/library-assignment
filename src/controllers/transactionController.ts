import { Request, Response, RequestHandler } from "express";
import Book from "../models/bookModel";
import Transaction from "../models/transactionModel";
import User from "../models/userModel";
import mongoose from "mongoose";

export const getBookIssuanceDetailsByName: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name } = req.params;

  try {
    const books = await Book.find({ name: { $regex: name, $options: "i" } });
    const bookIds = books.map((book) => book._id);

    if (bookIds.length === 0) {
      res
        .status(404)
        .json({ message: "No books found with the given name or term" });
      return;
    }

    const transactions = await Transaction.find({
      bookId: { $in: bookIds },
    }).populate("userId");
    const currentlyIssued = await Transaction.findOne({
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
  } catch (error) {
    res.status(500).json({ error: "Failed to get issuance details" });
  }
};

export const getTotalRentByBookName: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name } = req.params;

  try {
    const books = await Book.find({ name: { $regex: name, $options: "i" } });
    const bookIds = books.map((book) => book._id);

    if (bookIds.length === 0) {
      res
        .status(404)
        .json({ message: "No books found with the given name or term" });
      return;
    }

    const transactions = await Transaction.find({ bookId: { $in: bookIds } });
    const totalRent = transactions.reduce(
      (acc, transaction) => acc + (transaction.totalRent || 0),
      0
    );

    res.json({ totalRent });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate total rent" });
    return;
  }
};

export const getBooksIssuedToUserByName: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userIdOrName } = req.params;

  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(userIdOrName);

    const user = await User.findOne(
      isObjectId
        ? { _id: userIdOrName }
        : { name: { $regex: userIdOrName, $options: "i" } }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const transactions = await Transaction.find({ userId: user._id }).populate(
      "bookId"
    );
    const booksIssued = transactions.map((t) => t.bookId);

    res.json(booksIssued);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get books issued to user" });
  }
};

export const getBooksIssuedInDateRange = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { startDate, endDate } = req.query;

  try {
    const transactions = await Transaction.find({
      issueDate: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      },
    }).populate("bookId userId");

    const issuedBooks = transactions.map((t) => ({
      book: t.bookId,
      issuedTo: t.userId,
    }));

    res.json(issuedBooks);
    return;
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get books issued in the date range" });
    return;
  }
};

export const issueBook = async (req: Request, res: Response): Promise<void> => {
  const { bookName, userId, issueDate } = req.body;

  const book = await Book.findOne({ name: bookName });
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const activeTransaction = await Transaction.findOne({
    bookId: book._id,
    returnDate: null,
  });

  if (activeTransaction) {
    res
      .status(400)
      .json({ error: "Book is already issued and not yet returned" });
    return;
  }

  const transaction = new Transaction({
    bookId: book._id,
    userId,
    issueDate,
    returnDate: null,
    totalRent: 0,
  });

  await transaction.save();
  res.status(201).json(transaction);
};

export const returnBook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { bookName, userId, returnDate } = req.body;

  const book = await Book.findOne({ name: bookName });
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const transaction = await Transaction.findOne({
    bookId: book._id,
    userId,
    returnDate: null,
  });

  if (!transaction) {
    res.status(404).json({ error: "No active transaction found." });
    return;
  }

  const daysRented =
    (new Date(returnDate).getTime() -
      new Date(transaction.issueDate).getTime()) /
    (1000 * 3600 * 24);

  transaction.returnDate = returnDate;
  transaction.totalRent = daysRented * book.rentPerDay;

  await transaction.save();
  res.json(transaction);
};

export const transactionsInDateRange = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { startDate, endDate } = req.query;

  try {
    function getDatesInRange(startDate: Date, endDate: Date): Date[] {
      const dates: Date[] = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return dates;
    }

    const transactions = await Transaction.find({
      $or: [
        {
          issueDate: {
            $gte: new Date(startDate as string),
            $lte: new Date(endDate as string),
          },
        },
        {
          returnDate: {
            $gte: new Date(startDate as string),
            $lte: new Date(endDate as string),
          },
        },
      ],
    });

    const dateRange = getDatesInRange(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    const transactionCountPerDay: Record<string, number> = {};

    dateRange.forEach((date) => {
      const dateString = date.toISOString().split("T")[0];
      transactionCountPerDay[dateString] = 0;
    });

    transactions.forEach((transaction) => {
      const issueDate = new Date(transaction.issueDate)
        .toISOString()
        .split("T")[0];
      const returnDate = new Date(transaction.returnDate)
        .toISOString()
        .split("T")[0];

      dateRange.forEach((date) => {
        const dateString = date.toISOString().split("T")[0];

        if (issueDate === dateString || returnDate === dateString) {
          transactionCountPerDay[dateString]++;
        }
      });
    });

    const filteredTransactionCountPerDay = Object.fromEntries(
      Object.entries(transactionCountPerDay).filter(([_, count]) => count > 0)
    );

    res.json(filteredTransactionCountPerDay);
    return;
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
    return;
  }
};

export const transactionsInDateRangeByAggregation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { startDate, endDate } = req.query;

  try {
    const transactionsPerDay = await Transaction.aggregate([
      {
        $match: {
          $or: [
            {
              issueDate: {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string),
              },
            },
            {
              returnDate: {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string),
              },
            },
          ],
        },
      },
      {
        $project: {
          transactionDates: ["$issueDate", "$returnDate"],
        },
      },
      {
        $unwind: "$transactionDates",
      },
      {
        $match: {
          transactionDates: {
            $gte: new Date(startDate as string),
            $lte: new Date(endDate as string),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$transactionDates" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const transactionCountPerDay = transactionsPerDay.reduce(
      (acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      },
      {} as Record<string, number>
    );

    res.json(transactionCountPerDay);
    return;
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
    return;
  }
};
