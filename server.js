const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
app.get("/", (req, res) => {
  res.send("🚀 Сервер работает на Render!");
});

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Проверяем, загружается ли .env
console.log("🔍 Проверяем наличие .env файла...");
console.log(
  "Файл .env существует?",
  fs.existsSync(path.resolve(__dirname, ".env"))
);
console.log("📢 EMAIL_USER:", process.env.EMAIL_USER || "❌ НЕ НАЙДЕН");
console.log(
  "📢 EMAIL_PASS:",
  process.env.EMAIL_PASS ? "✅ НАЙДЕН" : "❌ НЕ НАЙДЕН"
);

app.post("/upload", upload.array("files"), async (req, res) => {
  try {
    console.log("📩 Получены данные:", req.body);
    console.log("📂 Загруженные файлы:", req.files);

    const { name, phone } = req.body;
    const files = req.files;

    if (!name || !phone) {
      return res.status(400).send("❌ Имя и телефон обязательны!");
    }

    if (!files || files.length === 0) {
      return res.status(400).send("❌ Файлы не загружены!");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "lelush.kek@gmail.com", // Замените на ваш email
      subject: "Новая заявка с сайта",
      text: `Имя: ${name}\nТелефон: ${phone}`,
      attachments: files.map((file) => ({
        filename: file.originalname,
        content: file.buffer,
      })),
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Письмо отправлено!");
    res.status(200).send("Email отправлен успешно");
  } catch (error) {
    console.error("❌ Ошибка сервера:", error);
    res.status(500).send("Ошибка сервера: " + error.message);
  }
});

app.listen(5000, () =>
  console.log("🚀 Сервер запущен на http://localhost:5000")
);
