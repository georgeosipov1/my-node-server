const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Раздаем статику (HTML, CSS, JS)
app.use(express.static("public"));

// Обработчик главной страницы
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Обработчик загрузки файлов и отправки email
app.post("/upload", upload.array("files"), async (req, res) => {
  try {
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
      to: "your-email@example.com", // Укажите свою почту
      subject: "📩 Новая заявка с файлами",
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
