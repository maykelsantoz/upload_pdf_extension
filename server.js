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

app.post("/baixar", async (req, responseExpress) => {
  try {
    const { url, filename, cookies } = req.body;
    if (!url || !filename) return responseExpress.status(400).send("url e filename são obrigatórios");

    const response = await fetch(url, {
      headers: cookies ? { "Cookie": cookies } : {}
    });

    if (!response.ok) {
      console.error(`Erro ao baixar PDF: ${response.status} ${response.statusText}`);
      return responseExpress.status(response.status).send("Erro ao baixar o PDF");
    }

    const arrayBuffer = await response.arrayBuffer();
    const filePath = path.join(PASTA_DOWNLOAD, filename);

    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    console.log(`✅ PDF salvo em: ${filePath}`);
    responseExpress.json({ success: true, path: filePath });
  } catch (err) {
    console.error("Erro ao baixar PDF:", err);
    responseExpress.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor local rodando em http://localhost:${PORT}`));
