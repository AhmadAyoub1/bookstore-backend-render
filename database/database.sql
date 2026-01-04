CREATE DATABASE IF NOT EXISTS bookstore_db;
USE bookstore_db;

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  coverImage VARCHAR(500),
  featured BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  book_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_item (session_id, book_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'Cash on Delivery',
  status VARCHAR(50) DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  book_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

INSERT INTO books (title, author, price, category, description, coverImage, featured) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 12.99, 'Fiction', 'A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop', TRUE),
('To Kill a Mockingbird', 'Harper Lee', 14.99, 'Fiction', 'A gripping tale of injustice and childhood innocence in the American South during the Great Depression.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop', TRUE),
('1984', 'George Orwell', 13.99, 'Science Fiction', 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop', TRUE),
('The Hobbit', 'J.R.R. Tolkien', 15.99, 'Fantasy', 'A fantasy novel about the quest of home-loving Bilbo Baggins to win a share of the treasure guarded by Smaug the dragon.', 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=600&fit=crop', TRUE),
('Pride and Prejudice', 'Jane Austen', 11.99, 'Romance', 'A romantic novel of manners that follows the character development of Elizabeth Bennet.', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', FALSE),
('The Catcher in the Rye', 'J.D. Salinger', 13.49, 'Fiction', 'The story of teenage rebellion and alienation told through the eyes of Holden Caulfield.', 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop', FALSE),
('Sapiens', 'Yuval Noah Harari', 18.99, 'Non-Fiction', 'A brief history of humankind that explores how Homo sapiens came to dominate the world.', 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop', TRUE),
('Atomic Habits', 'James Clear', 16.99, 'Self-Help', 'An easy and proven way to build good habits and break bad ones through tiny changes.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop', TRUE),
('Dune', 'Frank Herbert', 16.99, 'Science Fiction', 'Set in the distant future amidst a huge interstellar empire, Dune tells the story of young Paul Atreides.', 'https://images.unsplash.com/photo-1614544048536-0d28caf77f41?w=400&h=600&fit=crop', TRUE),
('The Power of Now', 'Eckhart Tolle', 15.49, 'Self-Help', 'A guide to spiritual enlightenment and living in the present moment.', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop', FALSE),
('Educated', 'Tara Westover', 17.99, 'Biography', 'A memoir about a young woman who leaves her survivalist family and goes on to earn a PhD from Cambridge.', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop', FALSE),
('Thinking, Fast and Slow', 'Daniel Kahneman', 19.99, 'Psychology', 'Explores the two systems that drive the way we think and make choices.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop', FALSE),
('The Alchemist', 'Paulo Coelho', 14.49, 'Fiction', 'A philosophical book that tells the story of Santiago, an Andalusian shepherd boy who yearns to travel.', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=600&fit=crop', FALSE),
('Clean Code', 'Robert C. Martin', 21.99, 'Technology', 'A handbook of agile software craftsmanship teaching the principles of writing clean code.', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=600&fit=crop', FALSE),
('Becoming', 'Michelle Obama', 18.49, 'Biography', 'The memoir of the former First Lady of the United States, chronicling her life experiences.', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop', FALSE);

