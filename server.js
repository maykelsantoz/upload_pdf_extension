// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

// Permite qualquer origem
app.use(cors());
app.use(express.json());

// Pasta padrão de download
const PASTA_DOWNLOAD = path.join(__dirname, "DownloadsInC");
if (!fs.existsSync(PASTA_DOWNLOAD)) {
  fs.mkdirSync(PASTA_DOWNLOAD, { recursive: true });
}

// Rota de teste no navegador
app.get("/", (req, res) => {
  res.send("🚀 Servidor está rodando! Use POST em /baixar para baixar PDFs.");
});

// Endpoint para baixar PDF
app.post("/baixar", async (req, res) => {
  try {
    let { url, filename, cookies } = req.body;
    if (!url || !filename) {
      return res.status(400).send("url e filename são obrigatórios");
    }

    // Corrige URL relativa -> absoluta
    if (!url.startsWith("http")) {
      url = new URL(url, "https://corporativo.sinceti.net.br/").toString();
    }

    const response = await fetch(url, {
      headers: cookies ? { "Cookie": cookies } : {}
    });

    if (!response.ok) {
      return res.status(response.status).send("Erro ao baixar o PDF");
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

// Inicia servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor local rodando em http://localhost:${PORT}`);
});
