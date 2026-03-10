import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

// [RU] Разрешаем запросы (чтобы React на порту 5173 мог обращаться к серверу на порту 3001)
app.use(cors());
// [RU] ВАЖНО: Учим Express понимать формат JSON в req.body!
app.use(express.json());

// [RU] Создаем маршрут (API endpoint), по которому React будет просить данные
app.get("/api/portfolio", async (req, res) => {
  try {
    // [RU] Просим Призму достать ВСЕ записи из таблицы PortfolioItem
    const items = await prisma.portfolioItem.findMany();
    // [RU] Отправляем их обратно в формате JSON
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error retrieving data from the database" });
  }
});

// [RU] Маршрут для добавления нового актива в базу
// [RU] Добавление нового актива в базу данных (CREATE)
app.post("/api/portfolio", async (req, res) => {
  try {
    // 1. Вытаскиваем данные, которые прислала наша красивая модалка
    const { coinId, amount, buyPrice } = req.body;

    // 2. Проверяем, всё ли пришло (базовая защита)
    if (!coinId || amount === undefined || buyPrice === undefined) {
      return res.status(400).json({ error: "Not all fields are filled in!" });
    }

    // 3. Даем команду Призме создать строку в таблице PortfolioItem
    const newAsset = await prisma.portfolioItem.create({
      data: {
        coinId: String(coinId),
        amount: Number(amount),
        buyPrice: Number(buyPrice),
      },
    });

    // 4. Отправляем успешно созданную запись обратно в браузер
    res.status(201).json(newAsset);
  } catch (error) {
    console.error("Error saving asset:", error);
    res.status(500).json({ error: "Failed to save asset to database" });
  }
});

// [RU] Обновление актива в базе данных (UPDATE)
app.put("/api/portfolio/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, buyPrice } = req.body;

    // Даем команду Призме найти запись по ID и обновить её поля
    const updatedAsset = await prisma.portfolioItem.update({
      where: { id: Number(id) },
      data: {
        amount: Number(amount),
        buyPrice: Number(buyPrice),
      },
    });

    // Отправляем обновленную запись обратно на фронтенд
    res.status(200).json(updatedAsset);
  } catch (error) {
    console.error("Error updating asset:", error);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

// [RU] Удаление актива из базы данных (DELETE)
app.delete("/api/portfolio/:id", async (req, res) => {
  try {
    // 1. Достаем ID из URL (например, /api/portfolio/5 -> id будет 5)
    const { id } = req.params;

    // 2. Командуем Призме удалить запись.
    // ВАЖНО: оборачиваем id в Number(), так как в URL это строка, а в базе у нас Int
    await prisma.portfolioItem.delete({
      where: {
        id: Number(id),
      },
    });

    // 3. Отправляем успешный статус (200 OK)
    res.status(200).json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Error deleting asset:", error);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

// [RU] Запускаем сервер на порту 3001
app.listen(3001, () => {
  console.log("🚀 API Server is running on http://localhost:3001");
});
