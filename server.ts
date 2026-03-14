import express from "express";
import cors from "cors";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

// Allow requests (so that React on port 5173 can contact the server on port 3001)
app.use(cors());
// IMPORTANT: Teaching Express to understand JSON format in req.body
app.use(express.json());

app.get("/api/markets", async (req, res) => {
  try {
    // Bypassing CORS
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=true",
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error with request to CoinGecko:", error);
    res.status(500).json({ error: "Unable to retrieve market data" });
  }
});

// The route (API endpoint) which React will request data from
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

app.get("/api/dashboard", async (req, res) => {
  try {
    const [
      fngResult, // Alternative.me (Fear and Greed)
      feesResult, // Mempool.space (Fees recommended)
      lsResult, // Binance (globalLongShortAccountRatio)
      stablesResult, // DefiLlama (Stablecoins Market Cap)
      cgGlobalResult, // CoinGecko Global (Market Cap + Dominance)
      cgTrendingResult, // CoinGecko Trending
      cgDefiResult, // CoinGecko DeFi
      hyperResult, // Hyperliquid (Open Interest + Funding)
    ] = await Promise.allSettled([
      fetch("https://api.alternative.me/fng/"),
      fetch("https://mempool.space/api/v1/fees/recommended"),
      fetch(
        "https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=5m&limit=1",
      ),
      fetch("https://stablecoins.llama.fi/stablecoincharts/all"),
      fetch("https://api.coingecko.com/api/v3/global"),
      fetch("https://api.coingecko.com/api/v3/search/trending"),
      fetch(
        "https://api.coingecko.com/api/v3/global/decentralized_finance_defi",
      ),
      fetch("https://api.hyperliquid.xyz/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "metaAndAssetCtxs" }),
      }),
    ]);

    const dashboardData: any = {};

    // 1. FNG
    if (fngResult.status === "fulfilled" && fngResult.value.ok) {
      const fngJson = await fngResult.value.json();
      dashboardData.fearAndGreed = fngJson.data[0];
    } else dashboardData.fearAndGreed = null;

    // 2. FEES
    if (feesResult.status === "fulfilled" && feesResult.value.ok) {
      const feesJson = await feesResult.value.json();
      dashboardData.fees = feesJson;
    } else dashboardData.fees = null;

    // 3. LONG/SHORT
    if (lsResult.status === "fulfilled" && lsResult.value.ok) {
      const lsJson = await lsResult.value.json();
      const raw = lsJson[0];

      const longsPercent = parseFloat(raw.longAccount) * 100;
      const cleanData = {
        longs: Number(longsPercent.toFixed(1)),
        shorts: Number((100 - longsPercent).toFixed(1)),
        ratio: parseFloat(raw.longShortRatio).toFixed(2),
      };

      dashboardData.longShort = cleanData;
    } else {
      dashboardData.longShort = null;
    }

    // 4. STABLECOINS
    if (stablesResult.status === "fulfilled" && stablesResult.value.ok) {
      const stablesJson = await stablesResult.value.json();

      const last30Days = stablesJson.slice(-30);
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

      dashboardData.stablecoins = {
        currentCap: currentCap.toFixed(2),
        changePercent: changePercent.toFixed(2),
        chartData: chartData,
      };
    } else {
      dashboardData.stablecoins = null;
    }

    // 5. COINGECKO: GLOBAL (Market Cap + Dominance)
    if (cgGlobalResult.status === "fulfilled" && cgGlobalResult.value.ok) {
      const cgJson = await cgGlobalResult.value.json();
      const data = cgJson.data;

      dashboardData.marketCap = {
        total: (data.total_market_cap.usd / 1e12).toFixed(2),
        volume24h: (data.total_volume.usd / 1e9).toFixed(0),
      };

      dashboardData.dominance = {
        btc: data.market_cap_percentage.btc.toFixed(1),
        eth: data.market_cap_percentage.eth.toFixed(1),
        others: (
          100 -
          data.market_cap_percentage.btc -
          data.market_cap_percentage.eth
        ).toFixed(1),
      };
    } else {
      dashboardData.marketCap = null;
      dashboardData.dominance = null;
    }

    // 6. COINGECKO: TRENDING
    if (cgTrendingResult.status === "fulfilled" && cgTrendingResult.value.ok) {
      const trendJson = await cgTrendingResult.value.json();
      const topCoin = trendJson.coins[0].item;
      dashboardData.trending = {
        symbol: topCoin.symbol.toUpperCase(),
        change24h: topCoin.data.price_change_percentage_24h.usd.toFixed(2),
        isPositive: topCoin.data.price_change_percentage_24h.usd >= 0,
      };
    } else dashboardData.trending = null;

    // 7. COINGECKO: DEFI
    if (cgDefiResult.status === "fulfilled" && cgDefiResult.value.ok) {
      const defiJson = await cgDefiResult.value.json();
      dashboardData.defi = {
        mcap: (parseFloat(defiJson.data.defi_market_cap) / 1e9).toFixed(1),
        topCoin: defiJson.data.top_coin_name.toUpperCase(),
      };
    } else dashboardData.defi = null;

    // 8. HYPERLIQUID (Open Interest + Funding - 2 в 1!)
    if (hyperResult.status === "fulfilled" && hyperResult.value.ok) {
      const j = await hyperResult.value.json();
      const targetCoins = ["BTC", "ETH", "SOL", "HYPE", "DOGE", "SUI"];
      const hyperData: any[] = [];

      targetCoins.forEach((coinName) => {
        const idx = j[0].universe.findIndex((u: any) => u.name === coinName);
        if (idx !== -1) {
          hyperData.push({
            symbol: coinName,
            oi: (
              (parseFloat(j[1][idx].openInterest) *
                parseFloat(j[1][idx].markPx)) /
              1e9
            ).toFixed(2),
            rate: (parseFloat(j[1][idx].funding) * 100).toFixed(4),
            markPx: parseFloat(j[1][idx].markPx).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            }),
          });
        }
      });
      dashboardData.hyperliquid = hyperData;
    } else {
      dashboardData.hyperliquid = null;
    }

    res.json(dashboardData);
  } catch (error) {
    console.error("Dashboard Aggregator Error:", error);
    res.status(500).json({ error: "Failed to aggregate dashboard data" });
  }
});

// Run the server on 3001 port
app.listen(3001, () => {
  console.log("🚀 API Server is running on http://localhost:3001");
});
