// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Pasta de download absoluta (fora do snapshot do pkg)
const PASTA_DOWNLOAD = "C:/DownloadsInC";
if (!fs.existsSync(PASTA_DOWNLOAD)) fs.mkdirSync(PASTA_DOWNLOAD, { recursive: true });
console.log(`📂 Pasta de download: ${PASTA_DOWNLOAD}`);

app.post("/baixar", async (req, res) => {
  try {
    const { url, filename, cookies } = req.body;
    if (!url || !filename) return res.status(400).json({ success: false, error: "url e filename são obrigatórios" });

    const response = await fetch(url, {
      headers: cookies ? { "Cookie": cookies } : {}
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ success: false, error: text || "Erro ao baixar o PDF" });
    }

    const arrayBuffer = await response.arrayBuffer();
    const filePath = path.join(PASTA_DOWNLOAD, filename);
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    console.log(`✅ PDF salvo em: ${filePath}`);
    res.json({ success: true, path: filePath });

  } catch (err) {
    console.error("Erro ao baixar PDF:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor local rodando em http://localhost:${PORT}`));

