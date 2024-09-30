import { Router } from "express";
import {
  getBookIssuanceDetailsByName,
  getTotalRentByBookName,
  getBooksIssuedToUserByName,
  getBooksIssuedInDateRange,
  issueBook,
  returnBook,
} from "../controllers/transactionController";
import { validateBody } from "../middlewares/validateSchema";
import {
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

export default router;
