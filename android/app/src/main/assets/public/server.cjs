var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_meta = {};
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "50mb" }));
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "3D Misbahi Gallery Backend" });
});
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
        suggestedAlbum: "Highlights"
      });
    }
    if (base64Image) {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: cleanBase64
              }
            },
            {
              text: "Analyze this image for a futuristic photo gallery app. Return JSON with 'tags' (array of 5 string keywords like sunset, family, food, architecture, nature), 'description' (one short sentence summary), 'category' (e.g. People, Nature, Urban, Food, Event, Art, Technology, Document), 'dominantColors' (array of 3 hex colors), and 'suggestedAlbum' name."
            }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });
      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      return res.json({ success: true, ...parsed });
    } else {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Categorize media file "${title}" of type "${type}". Prompt: ${prompt || "Analyze type and give smart tags"}. Return JSON with 'tags' (array of 5 keywords), 'description' (1 sentence), 'category', and 'suggestedAlbum'.`,
        config: {
          responseMimeType: "application/json"
        }
      });
      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      return res.json({ success: true, ...parsed });
    }
  } catch (error) {
    console.error("AI Analysis error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "AI Analysis failed",
      tags: ["Imported", "Gallery"],
      category: "Uncategorized"
    });
  }
});
app.post("/api/ai/search-query", async (req, res) => {
  try {
    const { query, availableTags } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        keywords: [query.toLowerCase()],
        suggestedCategories: []
      });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `The user is searching a media gallery with query: "${query}". Available tags in gallery: ${JSON.stringify(availableTags || [])}. Expand this query into relevant search terms, categories, and media types. Return JSON with 'keywords' (array of lowercased strings), 'targetType' ('photo', 'video', 'audio', 'doc', or 'any'), and 'mood'.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, ...parsed });
  } catch (err) {
    res.json({ success: false, keywords: [req.body.query?.toLowerCase() || ""] });
  }
});
app.post("/api/ai/generate-story", async (req, res) => {
  try {
    const { itemsCount, theme } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        storyTitle: `${theme || "Summer"} Memory Voyage`,
        subtitle: `A curated collection of ${itemsCount || 8} captured moments`,
        narration: "A beautiful journey through timeless memories."
      });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Create an inspiring short gallery memory story for a collection of ${itemsCount || 8} photos/videos themed around "${theme || "Memories"}". Return JSON with 'storyTitle' (poetic title), 'subtitle' (date or location context), and 'narration' (3 short sentences describing the memory flow).`,
      config: {
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, ...parsed });
  } catch (err) {
    res.json({
      storyTitle: "Moments & Memories",
      subtitle: "Gallery Highlight",
      narration: "Captured moments gathered in 3D Misbahi space."
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`3D Misbahi Gallery server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
