import { Request, Response } from "express";
import Book from "../models/bookModel";

export const getBooksByFilters = async (req: Request, res: Response) => {
  const { name, rentMin, rentMax, category } = req.query;

  const filter: any = {};

  if (name) filter.name = { $regex: name, $options: "i" };
  if (category) filter.category = category;
  if (rentMin || rentMax) {
    filter.rentPerDay = {
      ...(rentMin && { $gte: Number(rentMin) }),
      ...(rentMax && { $lte: Number(rentMax) }),
    };
  }

  try {
    const books = await Book.find(filter);
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
