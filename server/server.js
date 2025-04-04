/************************************************
 * server.js (Node + Express + SQLite)
 ************************************************/
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto"); // для генерації токена

// >>> GOOGLE AUTH START <<<
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// >>> GOOGLE AUTH END <<<

const app = express();
const PORT = 3000;

// ===================== БАЗА ДАНИХ =====================
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error("DB error:", err);
  else console.log("Connected to database.db");
});

// Таблиця `users`
db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  isVerified INTEGER NOT NULL DEFAULT 0,
  verifyToken TEXT,
  googleId TEXT
);
`);

// Таблиця `games` (записи про ігри/результати)
db.run(`
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  startTime DATETIME,
  endTime DATETIME,
  score INTEGER,
  duration INTEGER,
  FOREIGN KEY (userId) REFERENCES users(id)
);
`);


// ===================== APP.USE =====================
app.use(
  cors({
    origin: "http://localhost:5173", // або ваш фронтенд
    credentials: true,
  })
);
app.use(bodyParser.json());

// >>> GOOGLE AUTH START <<<
// 1. Налаштовуємо session (для Passport)
app.use(
  session({
    secret: "", // ЗАМІНІТЬ на свій секрет
    resave: false,
    saveUninitialized: false,
  })
);

// 2. Ініціалізуємо Passport
app.use(passport.initialize());
app.use(passport.session());

// 3. Налаштування стратегії Google
passport.use(
  new GoogleStrategy(
    {
      clientID: "", // ЗАМІНІТЬ на свої дані
      clientSecret: "", // ЗАМІНІТЬ на свої дані
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // У profile доступні дані користувача з Google
      const googleId = profile.id;
      const email = profile.emails?.[0]?.value;

      // 1) Шукаємо користувача з таким googleId
      db.get("SELECT * FROM users WHERE googleId = ?", [googleId], (err, user) => {
        if (err) {
          return done(err, null);
        }
        if (user) {
          // Вже є у БД
          return done(null, user);
        } else {
          // Немає googleId => перевіримо, чи є такий email
          db.get("SELECT * FROM users WHERE email = ?", [email], (err2, existingUser) => {
            if (err2) {
              return done(err2, null);
            }
            if (existingUser) {
              // Є користувач із таким email -> допишемо googleId
              db.run(
                "UPDATE users SET googleId = ? WHERE id = ?",
                [googleId, existingUser.id],
                function (updErr) {
                  if (updErr) {
                    return done(updErr, null);
                  }
                  existingUser.googleId = googleId;
                  return done(null, existingUser);
                }
              );
            } else {
              // Немає користувача взагалі -> створимо
              const nickname = profile.displayName || email;
              const password = "GOOGLE_NO_PASS"; // умовно
              db.run(
                `INSERT INTO users (nickname, email, password, isVerified, verifyToken, googleId)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [nickname, email, password, 1, null, googleId],
                function (insErr) {
                  if (insErr) {
                    return done(insErr, null);
                  }
                  const newUser = {
                    id: this.lastID,
                    nickname,
                    email,
                    isVerified: 1,
                    googleId,
                  };
                  return done(null, newUser);
                }
              );
            }
          });
        }
      });
    }
  )
);


// Get leaderboard data
app.get('/api/leaderboard', (req, res) => {
  db.all(
    `SELECT g.score, g.endTime, u.nickname 
     FROM games g 
     JOIN users u ON g.userId = u.id 
     WHERE g.score IS NOT NULL 
     ORDER BY g.score DESC 
     LIMIT 10`,
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch leaderboard data' });
      }
      res.json(rows);
    }
  );
});


// 4. Серіалізація/десеріалізація для сесії
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, user) => {
    if (err) return done(err);
    return done(null, user);
  });
});

// 5. Маршрути для авторизації через Google
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login-failed" }),
  (req, res) => {
    const userId = req.user?.id;
    // Add user data to the redirect URL
    res.redirect(`http://localhost:5173/login?userId=${userId}&auth=google`);
  }
);

app.get("/login-failed", (req, res) => {
  res.send("Google login failed!");
});
// >>> GOOGLE AUTH END <<<

// ===================== NODEMAILER (ETHEREAL) =====================
let testAccount = null;
nodemailer.createTestAccount().then((account) => {
  testAccount = account;
  console.log("Ethereal test account created:", account);
});

async function sendVerificationEmail(toEmail, token) {
  if (!testAccount) {
    console.log("No testAccount yet, cannot send email");
    return;
  }
  const verifyLink = `http://localhost:3000/api/verify-email?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Snake Game" <no-reply@snakegame.com>',
    to: toEmail,
    subject: "Please verify your email",
    text: `Click the link to verify: ${verifyLink}`,
    html: `<p>Click the link to verify your account:</p>
           <a href="${verifyLink}">${verifyLink}</a>`,
  });

  console.log("Message sent:", info.messageId);
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
}

// ===================== РЕЄСТРАЦІЯ =====================
app.post("/api/register", async (req, res) => {
  try {
    const { nickname, email, password } = req.body;
    if (!nickname || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    db.get("SELECT id FROM users WHERE email = ?", [email], async (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "DB error" });
      }
      if (row) {
        return res.status(400).json({ error: "Email already taken" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const token = crypto.randomBytes(20).toString("hex");

      db.run(
        "INSERT INTO users (nickname, email, password, isVerified, verifyToken) VALUES (?, ?, ?, ?, ?)",
        [nickname, email, hashedPassword, 0, token],
        function (err2) {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ error: "Failed to register" });
          }
          const newUserId = this.lastID;
          sendVerificationEmail(email, token)
            .then(() => {
              res.json({
                message: "User registered. Check your email to verify.",
                userId: newUserId,
              });
            })
            .catch((sendErr) => {
              console.error(sendErr);
              res.json({
                message: "User registered but failed to send verification email.",
                userId: newUserId,
              });
            });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===================== ВЕРИФІКАЦІЯ EMAIL =====================
app.get("/api/verify-email", (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ error: "No token" });
  }
  db.get("SELECT id FROM users WHERE verifyToken = ?", [token], (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }
    if (!user) {
      return res.status(400).json({ error: "Invalid token" });
    }
    db.run(
      "UPDATE users SET isVerified = 1, verifyToken = NULL WHERE id = ?",
      [user.id],
      function (err2) {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ error: "Failed to verify" });
        }
        return res.json({ message: "Email verified successfully" });
      }
    );
  });
});

// ===================== ЛОГІН =====================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    if (user.isVerified === 0) {
      return res.status(403).json({ error: "Email is not verified" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid password" });
    }
    // Успіх - в реалі тут віддати JWT
    res.json({
      message: "Login success",
      userId: user.id,
      nickname: user.nickname,
    });
  });
});

// ===================== ЗМІНА ПАРОЛЯ =====================
app.post("/api/change-password", (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ error: "Missing data" });
  }
  db.get("SELECT password FROM users WHERE id = ?", [userId], async (err, row) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!row) return res.status(404).json({ error: "User not found" });
    const match = await bcrypt.compare(oldPassword, row.password);
    if (!match) {
      return res.status(401).json({ error: "Old password incorrect" });
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    db.run("UPDATE users SET password = ? WHERE id = ?", [newHash, userId], (err2) => {
      if (err2) return res.status(500).json({ error: "DB error updating password" });
      res.json({ message: "Password changed" });
    });
  });
});

// ===================== СТАРТ / ЗАВЕРШЕННЯ ГРИ (games) =====================

// Почати гру (startTime)
app.post("/api/start-game", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "No userId" });

  const startTime = new Date().toISOString();
  db.run(
    "INSERT INTO games (userId, startTime) VALUES (?, ?)",
    [userId, startTime],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "DB error" });
      }
      res.json({ message: "Game started", gameId: this.lastID });
    }
  );
});

// Завершити гру (endTime + score)
app.post("/api/end-game", (req, res) => {
  const { userId, gameId, score } = req.body;
  if (!userId || !gameId)
    return res.status(400).json({ error: "Missing data" });

  const endTime = new Date().toISOString();
  db.run(
    "UPDATE games SET endTime = ?, score = ? WHERE id = ? AND userId = ?",
    [endTime, score, gameId, userId],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "DB error" });
      }
      if (this.changes === 0) {
        return res
          .status(404)
          .json({ error: "Game not found or not your game" });
      }
      res.json({ message: "Game ended", finalScore: score });
    }
  );
});

// ===================== Окремий маршрут для /api/save-score =====================
// (Якщо ви хочете "просто" зберегти score без start/end)
app.post("/api/save-score", (req, res) => {
  const { userId, score, duration } = req.body;
  if (!userId || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }

  const now = new Date().toISOString();
  db.run(
    "INSERT INTO games (userId, startTime, endTime, score, duration) VALUES (?, ?, ?, ?, ?)",
    [userId, now, now, score, duration],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to save score" });
      }
      return res.json({ message: "Score saved", gameId: this.lastID });
    }
  );
});

// ===================== /api/my-games (журнал ігор) =====================
app.get("/api/my-games", (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "No userId" });

  db.all(
    "SELECT * FROM games WHERE userId = ? ORDER BY id DESC",
    [userId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "DB error" });
      }
      res.json(rows);
    }
  );
});

// ===================== ОТРИМАТИ ДАНІ КОРИСТУВАЧА =====================
app.get("/api/get-user/:id", (req, res) => {
  const userId = req.params.id;
  db.get(
    "SELECT id, nickname, email, isVerified FROM users WHERE id = ?",
    [userId],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "DB error" });
      }
      if (!row) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        id: row.id,
        nickname: row.nickname,
        email: row.email,
        isVerified: !!row.isVerified,
      });
    }
  );
});

// ===================== GET-BEST-SCORE (з таблиці games) =====================
app.get("/api/get-best-score", (req, res) => {
  // Якщо хочете глобальний найбільший score незалежно від userId:
  db.get("SELECT MAX(score) AS bestScore FROM games", (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }
    const bestScore = row && row.bestScore ? row.bestScore : 0;
    return res.json({ bestScore });
  });
});

// Запускаємо сервер
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
