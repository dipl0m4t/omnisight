import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

// [RU] Разрешаем запросы (чтобы React на порту 5173 мог обращаться к серверу на порту 3001)
app.use(cors());

// [RU] Создаем маршрут (API endpoint), по которому React будет просить данные
app.get("/api/portfolio", async (req, res) => {
  try {
    // [RU] Просим Призму достать ВСЕ записи из таблицы PortfolioItem
    const items = await prisma.portfolioItem.findMany();
    // [RU] Отправляем их обратно в формате JSON
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка при получении данных из БД" });
  }
});

// [RU] Запускаем сервер на порту 3001
app.listen(3001, () => {
  console.log("🚀 API Сервер запущен на http://localhost:3001");
});
