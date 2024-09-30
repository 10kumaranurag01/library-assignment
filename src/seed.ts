import mongoose from "mongoose";
import dotenv from "dotenv";
import userSchema from "./models/userModel";
import bookSchema from "./models/bookModel";

dotenv.config();

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  throw new Error("MONGODB_URI is not defined in the environment variables.");
}

const generateRandomUsers = (num: number) => {
  const users = [];
  for (let i = 0; i < num; i++) {
    users.push({
      name: `User${i + 1}`,
      email: `user${i + 1}@example.com`,
    });
  }
  return users;
};

const generateRandomBooks = (num: number) => {
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

const seedDatabase = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");

    const users = generateRandomUsers(5);
    await userSchema.insertMany(users);
    console.log("Inserted 5 random users");

    const books = generateRandomBooks(20);
    await bookSchema.insertMany(books);
    console.log("Inserted 20 random books");

    await mongoose.connection.close();
    console.log("Database seeding complete");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

seedDatabase();
