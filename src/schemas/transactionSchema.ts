import { z } from "zod";

export const issueBookSchema = z.object({
  bookName: z.string().min(1, "Book Name is required"),
  userId: z.string().min(1, "User ID is required"),
  issueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid Issue Date format",
  }),
});

export const returnBookSchema = z.object({
  bookName: z.string().min(1, "Book Name is required"),
  userId: z.string().min(1, "User ID is required"),
  returnDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid Return Date format",
  }),
});

export const getTransactionsByDateRangeSchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid Start Date format",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid End Date format",
  }),
});
