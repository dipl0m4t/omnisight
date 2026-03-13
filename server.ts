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

    // Give the command to Prisma to create a row in the PortfolioItem table.
    const newAsset = await prisma.portfolioItem.create({
      data: {
        coinId: String(coinId),
        amount: Number(amount),
        buyPrice: Number(buyPrice),
      },
    });

    // Send the successfully created entry back to the browser
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
    console.error("Backend error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/long-short", async (req, res) => {
  try {
    const response = await fetch(
      "https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=5m&limit=1",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Binance API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const raw = data[0];

    const longsPercent = parseFloat(raw.longAccount) * 100;
    const cleanData = {
      longs: Number(longsPercent.toFixed(1)),
      shorts: Number((100 - longsPercent).toFixed(1)),
      ratio: parseFloat(raw.longShortRatio).toFixed(2),
    };

    res.json(cleanData);
  } catch (error: any) {
    console.error("Error in the Long/Short API: ", error);
    res.status(500).json({ error: "Failed to fetch long/short data" });
  }
});

app.get("/api/stablecoins", async (req, res) => {
  try {
    const response = await fetch(
      "https://stablecoins.llama.fi/stablecoincharts/all",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DefiLlama API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const last30Days = data.slice(-30);
    const chartData = last30Days.map((item: any) => {
      const dateObj = new Date(item.date * 1000);

      return {
        date: dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: item.totalCirculating.peggedUSD / 1_000_000_000,
      };
    });
    const oldCap = chartData[0].value;
    const currentCap = chartData[chartData.length - 1].value;
    const changePercent = ((currentCap - oldCap) / oldCap) * 100;

    res.json({
      currentCap: currentCap.toFixed(2),
      changePercent: changePercent.toFixed(2),
      chartData: chartData,
    });
  } catch (error: any) {
    console.error("Error in the Stablecoins API: ", error);
    res.status(500).json({ error: "Failed to fetch stablecoins data" });
  }
});

// Run the server on 3001 port
app.listen(3001, () => {
  console.log("🚀 API Server is running on http://localhost:3001");
});
