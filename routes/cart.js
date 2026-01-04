const express = require('express');
const router = express.Router();
const db = require('../config/database');

const getSessionId = (req) => {
  return req.headers['x-session-id'] || req.body.sessionId || 'default-session';
};

router.get('/', async (req, res) => {
  const sessionId = getSessionId(req);
  
  const [cartItems] = await db.execute(
    `SELECT ci.*, b.title, b.author, b.price, b.coverImage, b.category 
     FROM cart_items ci 
     JOIN books b ON ci.book_id = b.id 
     WHERE ci.session_id = ?`,
    [sessionId]
  );

  const formattedItems = cartItems.map(item => ({
    id: item.book_id,
    title: item.title,
    author: item.author,
    price: parseFloat(item.price),
    coverImage: item.coverImage,
    category: item.category,
    quantity: item.quantity
  }));

  res.json(formattedItems);
});

router.post('/add', async (req, res) => {
  const sessionId = getSessionId(req);
  const { bookId, quantity = 1 } = req.body;

  if (!bookId) {
    return res.status(400).json({ error: 'Book ID is required' });
  }

  const [books] = await db.execute('SELECT * FROM books WHERE id = ?', [bookId]);
  if (books.length === 0) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const [existing] = await db.execute(
    'SELECT * FROM cart_items WHERE session_id = ? AND book_id = ?',
    [sessionId, bookId]
  );

  if (existing.length > 0) {
    const newQuantity = existing[0].quantity + parseInt(quantity);
    await db.execute(
      'UPDATE cart_items SET quantity = ? WHERE session_id = ? AND book_id = ?',
      [newQuantity, sessionId, bookId]
    );
  } else {
    await db.execute(
      'INSERT INTO cart_items (session_id, book_id, quantity) VALUES (?, ?, ?)',
      [sessionId, bookId, parseInt(quantity)]
    );
  }

  const [cartItems] = await db.execute(
    `SELECT ci.*, b.title, b.author, b.price, b.coverImage, b.category 
     FROM cart_items ci 
     JOIN books b ON ci.book_id = b.id 
     WHERE ci.session_id = ?`,
    [sessionId]
  );

  const formattedItems = cartItems.map(item => ({
    id: item.book_id,
    title: item.title,
    author: item.author,
    price: parseFloat(item.price),
    coverImage: item.coverImage,
    category: item.category,
    quantity: item.quantity
  }));

  res.json(formattedItems);
});

router.put('/update', async (req, res) => {
  const sessionId = getSessionId(req);
  const { bookId, quantity } = req.body;

  if (!bookId || quantity === undefined) {
    return res.status(400).json({ error: 'Book ID and quantity are required' });
  }

  if (parseInt(quantity) <= 0) {
    await db.execute(
      'DELETE FROM cart_items WHERE session_id = ? AND book_id = ?',
      [sessionId, bookId]
    );
  } else {
    await db.execute(
      'UPDATE cart_items SET quantity = ? WHERE session_id = ? AND book_id = ?',
      [parseInt(quantity), sessionId, bookId]
    );
  }

  const [cartItems] = await db.execute(
    `SELECT ci.*, b.title, b.author, b.price, b.coverImage, b.category 
     FROM cart_items ci 
     JOIN books b ON ci.book_id = b.id 
     WHERE ci.session_id = ?`,
    [sessionId]
  );

  const formattedItems = cartItems.map(item => ({
    id: item.book_id,
    title: item.title,
    author: item.author,
    price: parseFloat(item.price),
    coverImage: item.coverImage,
    category: item.category,
    quantity: item.quantity
  }));

  res.json(formattedItems);
});

router.delete('/remove/:bookId', async (req, res) => {
  const sessionId = getSessionId(req);
  const { bookId } = req.params;

  await db.execute(
    'DELETE FROM cart_items WHERE session_id = ? AND book_id = ?',
    [sessionId, bookId]
  );

  res.json({ message: 'Item removed from cart' });
});

router.delete('/clear', async (req, res) => {
  const sessionId = getSessionId(req);
  await db.execute('DELETE FROM cart_items WHERE session_id = ?', [sessionId]);
  res.json({ message: 'Cart cleared' });
});

module.exports = router;