const express = require("express");
const router = express.Router();
const db = require("../config/database");
const isAdmin = require("../middleware/isAdmin");

// GET all books
router.get("/", async (req, res) => {
  const { category, featured, search } = req.query;
  let query = "SELECT * FROM books WHERE 1=1";
  const params = [];

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  if (featured === "true") {
    query += " AND featured = TRUE";
  }

  if (search) {
    query += " AND (title LIKE ? OR author LIKE ? OR category LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += " ORDER BY createdAt DESC";

  const [books] = await db.execute(query, params);

  const formattedBooks = books.map((book) => ({
    ...book,
    price: parseFloat(book.price),
    featured: Boolean(book.featured),
  }));

  res.json(formattedBooks);
});

// GET single book
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const [books] = await db.execute("SELECT * FROM books WHERE id = ?", [id]);

  if (books.length === 0) {
    return res.status(404).json({ error: "Book not found" });
  }

  const book = {
    ...books[0],
    price: parseFloat(books[0].price),
    featured: Boolean(books[0].featured),
  };

  res.json(book);
});

// POST create book
router.post("/", isAdmin, async (req, res) => {
  const { title, author, price, category, description, featured, coverImage } =
    req.body;

  if (!title || !author || !price || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const coverImageUrl = coverImage || null;

  const [result] = await db.execute(
    "INSERT INTO books (title, author, price, category, description, coverImage, featured) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      title,
      author,
      parseFloat(price),
      category,
      description || null,
      coverImageUrl,
      featured === "true" || featured === true,
    ]
  );

  const [newBook] = await db.execute("SELECT * FROM books WHERE id = ?", [
    result.insertId,
  ]);

  res.status(201).json({
    ...newBook[0],
    price: parseFloat(newBook[0].price),
    featured: Boolean(newBook[0].featured),
  });
});

// PUT update book (ADMIN ONLY)
router.put("/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      author,
      price,
      category,
      description,
      coverImage,
      featured,
    } = req.body;

    // 🔎 Check if book exists
    const [existing] = await db.execute("SELECT * FROM books WHERE id = ?", [
      id,
    ]);

    if (existing.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    // ❗ Enforce required fields (same rule as ADD)
    if (
      !title ||
      !author ||
      !price ||
      !category ||
      !description ||
      !coverImage
    ) {
      return res.status(400).json({
        error: "All fields are required (including image and description)",
      });
    }

    // 🔄 Update book
    await db.execute(
      `
      UPDATE books
      SET title = ?, 
          author = ?, 
          price = ?, 
          category = ?, 
          description = ?, 
          coverImage = ?, 
          featured = ?
      WHERE id = ?
      `,
      [
        title,
        author,
        parseFloat(price),
        category,
        description,
        coverImage,
        featured === true || featured === "true",
        id,
      ]
    );

    // 📦 Return updated book
    const [updated] = await db.execute("SELECT * FROM books WHERE id = ?", [
      id,
    ]);

    res.json({
      ...updated[0],
      price: parseFloat(updated[0].price),
      featured: Boolean(updated[0].featured),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update book" });
  }
});

// DELETE book
router.delete("/:id", isAdmin, async (req, res) => {
  const { id } = req.params;

  const [existing] = await db.execute("SELECT * FROM books WHERE id = ?", [id]);
  if (existing.length === 0) {
    return res.status(404).json({ error: "Book not found" });
  }

  await db.execute("DELETE FROM books WHERE id = ?", [id]);

  res.json({ message: "Book deleted successfully" });
});

module.exports = router;
