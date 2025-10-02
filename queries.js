/**
 * queries.js - MongoDB Assignment
 * --------------------------------------------
 
 * - Covers CRUD, advanced queries, aggregation, and indexing
 **/

require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

const client = new MongoClient(uri);

async function main() {
  try {
    // -----------------------------
    // CONNECT TO MONGODB
    // -----------------------------
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);          // Select database
    const books = db.collection('books');  // Select collection

    // -----------------------------
    // TASK 2: BASIC CRUD OPERATIONS
    // -----------------------------

    // 1. Find all books in a specific genre
    const genreResults = await books.find({ genre: "Fiction" }).toArray();
    console.log('Books in genre "Fiction":', genreResults);

    // 2. Find books published after a certain year
    const yearResults = await books.find({ published_year: { $gt: 1950 } }).toArray();
    console.log('Books published after 1950:', yearResults);

    // 3. Find books by a specific author
    const authorResults = await books.find({ author: "George Orwell" }).toArray();
    console.log('Books by George Orwell:', authorResults);

    // 4. Update the price of a specific book
    const updateResult = await books.updateOne(
      { title: "1984" }, 
      { $set: { price: 15.99 } }
    );
    console.log('Updated price of "1984":', updateResult.modifiedCount);

    // 5. Delete a book by its title
    const deleteResult = await books.deleteOne({ title: "The Hobbit" });
    console.log('Deleted "The Hobbit":', deleteResult.deletedCount);

    // -----------------------------
    // TASK 3: ADVANCED QUERIES
    // -----------------------------

    // 1. Find books that are in stock AND published after 2010
    const inStockResults = await books.find({
      in_stock: true,
      published_year: { $gt: 2010 }
    }).toArray();
    console.log('In-stock books published after 2010:', inStockResults);

    // 2. Projection: only return title, author, price
    const projectionResults = await books.find(
      {},
      { projection: { title: 1, author: 1, price: 1, _id: 0 } }
    ).toArray();
    console.log('Projection (title, author, price):', projectionResults);

    // 3. Sort books by price ascending
    const sortAscResults = await books.find(
      {},
      { projection: { title: 1, price: 1, _id: 0 } }
    ).sort({ price: 1 }).toArray();
    console.log('Books sorted by price (ascending):', sortAscResults);

    // 4. Sort books by price descending
    const sortDescResults = await books.find(
      {},
      { projection: { title: 1, price: 1, _id: 0 } }
    ).sort({ price: -1 }).toArray();
    console.log('Books sorted by price (descending):', sortDescResults);

    // 5. Pagination: 5 books per page
    const pageSize = 5;
    for (let page = 1; page <= 2; page++) {  // example: first 2 pages
      const skipCount = (page - 1) * pageSize;
      const pageResults = await books.find(
        {},
        { projection: { title: 1, author: 1, _id: 0 } }
      ).skip(skipCount).limit(pageSize).toArray();
      console.log(`Page ${page} of books:`, pageResults);
    }

    // -----------------------------
    // TASK 4: AGGREGATION PIPELINES
    // -----------------------------

    // 1. Average price of books by genre
    const avgPriceResults = await books.aggregate([
      { $group: { _id: "$genre", avgPrice: { $avg: "$price" } } }
    ]).toArray();
    console.log('Average price by genre:', avgPriceResults);

    // 2. Author with the most books
    const topAuthorResults = await books.aggregate([
      { $group: { _id: "$author", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]).toArray();
    console.log('Author with most books:', topAuthorResults);

    // 3. Group books by publication decade and count
    const decadeResults = await books.aggregate([
      { $group: {
          _id: { $multiply: [{ $floor: { $divide: ["$published_year", 10] } }, 10] },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
    console.log('Books grouped by decade:', decadeResults);

    // -----------------------------
    // TASK 5: INDEXING
    // -----------------------------

    // 1. Create an index on title
    const titleIndex = await books.createIndex({ title: 1 });
    console.log('Index on title created:', titleIndex);

    // 2. Create a compound index on author + published_year
    const compoundIndex = await books.createIndex({ author: 1, published_year: 1 });
    console.log('Compound index on author + published_year created:', compoundIndex);

    // 3. Explain query performance with index
    const explainResult = await books.find({ title: "1984" }).explain("executionStats");
    console.log('Explain query with index:', explainResult.executionStats);

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {

    // Close connection once at the end

    await client.close();
    console.log('Connection closed');
  }
}

// Run all queries
main();
