import { Router } from "express";
import {
  getBookIssuanceDetailsByName,
  getTotalRentByBookName,
  getBooksIssuedToUserByName,
  getBooksIssuedInDateRange,
  issueBook,
  returnBook,
  transactionsInDateRange,
  transactionsInDateRangeByAggregation,
} from "../controllers/transactionController";
import { validateBody, validateQuery } from "../middlewares/validateSchema";
import {
  getTransactionsByDateRangeSchema,
  issueBookSchema,
  returnBookSchema,
} from "../schemas/transactionSchema";

const router = Router();

router.get("/book/:name/details", getBookIssuanceDetailsByName);
router.get("/book/:name/rent", getTotalRentByBookName);
router.get("/user/:userIdOrName/books", getBooksIssuedToUserByName);
router.get("/date-range", getBooksIssuedInDateRange);
router.post("/issue", validateBody(issueBookSchema), issueBook);
router.post("/return", validateBody(returnBookSchema), returnBook);
router.get(
  "/daily-summary",
  validateQuery(getTransactionsByDateRangeSchema),
  transactionsInDateRange
);
router.get(
  "/daily-summary-aggregate",
  validateQuery(getTransactionsByDateRangeSchema),
  transactionsInDateRangeByAggregation
);

export default router;
