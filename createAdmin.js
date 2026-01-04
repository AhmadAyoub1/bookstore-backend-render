const bcrypt = require("bcrypt");
const db = require("./config/database");

(async () => {
  const password = "admin123"; // you can change later
  const hashedPassword = await bcrypt.hash(password, 10);

  await db.execute(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ["Admin", "admin@bookstore.com", hashedPassword, "admin"]
  );

  console.log("✅ Admin created");
  process.exit();
})();
