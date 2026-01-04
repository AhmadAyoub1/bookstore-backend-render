const express = require('express');
const router = express.Router();
const db = require('../config/database');

const getSessionId = (req) => {
  return req.headers['x-session-id'] || req.body.sessionId || 'default-session';
};

router.get('/', async (req, res) => {
  const sessionId = getSessionId(req);

  const [orders] = await db.execute(
    'SELECT * FROM orders WHERE session_id = ? ORDER BY createdAt DESC',
    [sessionId]
  );

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const [items] = await db.execute(
        `SELECT oi.*, b.title, b.author, b.coverImage 
         FROM order_items oi 
         JOIN books b ON oi.book_id = b.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );

      return {
        ...order,
        total_amount: parseFloat(order.total_amount),
        items: items.map(item => ({
          ...item,
          price: parseFloat(item.price)
        }))
      };
    })
  );

  res.json(ordersWithItems);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const sessionId = getSessionId(req);

  const [orders] = await db.execute(
    'SELECT * FROM orders WHERE id = ? AND session_id = ?',
    [id, sessionId]
  );

  if (orders.length === 0) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const [items] = await db.execute(
    `SELECT oi.*, b.title, b.author, b.coverImage 
     FROM order_items oi 
     JOIN books b ON oi.book_id = b.id 
     WHERE oi.order_id = ?`,
    [id]
  );

  res.json({
    ...orders[0],
    total_amount: parseFloat(orders[0].total_amount),
    items: items.map(item => ({
      ...item,
      price: parseFloat(item.price)
    }))
  });
});

router.post('/', async (req, res) => {
  const sessionId = getSessionId(req);
  const { shippingAddress, paymentMethod = 'Cash on Delivery', cartItems } = req.body;

  if (!shippingAddress) {
    return res.status(400).json({ error: 'Shipping address is required' });
  }

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  let totalAmount = 0;
  for (const item of cartItems) {
    const [books] = await db.execute('SELECT price FROM books WHERE id = ?', [item.id]);
    if (books.length === 0) {
      return res.status(404).json({ error: `Book with ID ${item.id} not found` });
    }
    totalAmount += parseFloat(books[0].price) * item.quantity;
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (session_id, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?)',
      [sessionId, totalAmount, shippingAddress, paymentMethod]
    );

    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      const [books] = await connection.execute('SELECT price FROM books WHERE id = ?', [item.id]);
      const price = parseFloat(books[0].price);

      await connection.execute(
        'INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, price]
      );
    }

    await connection.execute('DELETE FROM cart_items WHERE session_id = ?', [sessionId]);

    await connection.commit();
    connection.release();

    const [orders] = await db.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [items] = await db.execute(
      `SELECT oi.*, b.title, b.author, b.coverImage 
       FROM order_items oi 
       JOIN books b ON oi.book_id = b.id 
       WHERE oi.order_id = ?`,
      [orderId]
    );

    res.status(201).json({
      ...orders[0],
      total_amount: parseFloat(orders[0].total_amount),
      items: items.map(item => ({
        ...item,
        price: parseFloat(item.price)
      }))
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    res.status(500).json({ error: 'Failed to create order' });
  }
});

module.exports = router;