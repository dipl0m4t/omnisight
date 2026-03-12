import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

// Allow requests (so that React on port 5173 can contact the server on port 3001)
app.use(cors());
// IMPORTANT: Teaching Express to understand JSON format in req.body
app.use(express.json());

// Create the route (API endpoint) which React will request data from
app.get("/api/portfolio", async (req, res) => {
  try {
    // Ask Prisma to retrieve ALL records from the PortfolioItem table.
    const items = await prisma.portfolioItem.findMany();
    // Send them back in JSON format
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error retrieving data from the database" });
  }
});

// Route for adding new assets in the DB
// Adding new asset in the DB (CREATE)
app.post("/api/portfolio", async (req, res) => {
  try {
    // Get the data that modal sent to us
    const { coinId, amount, buyPrice } = req.body;

    // Checking if everything has arrived (basic protection)
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

// Update the asset in the DB (UPDATE)
app.put("/api/portfolio/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, buyPrice } = req.body;

    // Give the command to Prisma to find an asset by ID and update its fields
    const updatedAsset = await prisma.portfolioItem.update({
      where: { id: Number(id) },
      data: {
        amount: Number(amount),
        buyPrice: Number(buyPrice),
      },
    });

    // Send the updated asset back to the frontend
    res.status(200).json(updatedAsset);
  } catch (error) {
    console.error("Error updating asset:", error);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

// Deleting the asset from the DB (DELETE)
app.delete("/api/portfolio/:id", async (req, res) => {
  try {
    // Get the ID from the URL (for example, /api/portfolio/5 -> id will be 5)
    const { id } = req.params;

    // Command Prisma to delete the entry.
    // IMPORTANT: Wrap the id in Number(), since in the URL it is a string, and in the database we have Int
    await prisma.portfolioItem.delete({
      where: {
        id: Number(id),
      },
    });

    // Send the successful status (200 OK)
    res.status(200).json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Error deleting asset:", error);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

app.get("/api/liquidations", async (req, res) => {
  try {
    // Working public endpoint of the Order Book (1000 orders)
    const binanceRes = await fetch(
      "https://fapi.binance.com/fapi/v1/depth?symbol=BTCUSDT&limit=1000",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      },
    );

    if (!binanceRes.ok) {
      const errText = await binanceRes.text();
      throw new Error(`Binance API Error ${binanceRes.status}: ${errText}`);
    }

    const data = await binanceRes.json();
    res.json(data);
  } catch (error: any) {
    console.error("🔥 Ошибка бэкенда:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Run the server on 3001 port
app.listen(3001, () => {
  console.log("🚀 API Server is running on http://localhost:3001");
});
