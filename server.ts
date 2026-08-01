import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini client lazily/safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "3D Misbahi Gallery Backend" });
});

// AI Smart Tagging / Image Analysis
app.post("/api/ai/analyze-media", async (req, res) => {
  try {
    const { title, type, prompt, base64Image } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        tags: ["AI Offline", "Local Indexed"],
        description: `Analyzed ${title || "media"} locally.`,
        category: "General",
        suggestedAlbum: "Highlights",
      });
    }

    if (base64Image) {
      // Vision analysis
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: cleanBase64,
              },
            },
            {
              text: "Analyze this image for a futuristic photo gallery app. Return JSON with 'tags' (array of 5 string keywords like sunset, family, food, architecture, nature), 'description' (one short sentence summary), 'category' (e.g. People, Nature, Urban, Food, Event, Art, Technology, Document), 'dominantColors' (array of 3 hex colors), and 'suggestedAlbum' name.",
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      return res.json({ success: true, ...parsed });
    } else {
      // Text / Metadata Analysis
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Categorize media file "${title}" of type "${type}". Prompt: ${prompt || "Analyze type and give smart tags"}. Return JSON with 'tags' (array of 5 keywords), 'description' (1 sentence), 'category', and 'suggestedAlbum'.`,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      return res.json({ success: true, ...parsed });
    }
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "AI Analysis failed",
      tags: ["Imported", "Gallery"],
      category: "Uncategorized",
    });
  }
});

// AI Semantic Search Endpoint
app.post("/api/ai/search-query", async (req, res) => {
  try {
    const { query, availableTags } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        keywords: [query.toLowerCase()],
        suggestedCategories: [],
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `The user is searching a media gallery with query: "${query}". Available tags in gallery: ${JSON.stringify(availableTags || [])}. Expand this query into relevant search terms, categories, and media types. Return JSON with 'keywords' (array of lowercased strings), 'targetType' ('photo', 'video', 'audio', 'doc', or 'any'), and 'mood'.`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, ...parsed });
  } catch (err: any) {
    res.json({ success: false, keywords: [req.body.query?.toLowerCase() || ""] });
  }
});

// AI Memory Story Highlight Generator
app.post("/api/ai/generate-story", async (req, res) => {
  try {
    const { itemsCount, theme } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        storyTitle: `${theme || "Summer"} Memory Voyage`,
        subtitle: `A curated collection of ${itemsCount || 8} captured moments`,
        narration: "A beautiful journey through timeless memories.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Create an inspiring short gallery memory story for a collection of ${itemsCount || 8} photos/videos themed around "${theme || "Memories"}". Return JSON with 'storyTitle' (poetic title), 'subtitle' (date or location context), and 'narration' (3 short sentences describing the memory flow).`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, ...parsed });
  } catch (err: any) {
    res.json({
      storyTitle: "Moments & Memories",
      subtitle: "Gallery Highlight",
      narration: "Captured moments gathered in 3D Misbahi space.",
    });
  }
});

// Vite Middleware Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`3D Misbahi Gallery server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
