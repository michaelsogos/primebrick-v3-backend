import cors from "cors";
import express from "express";
import { customersRouter } from "./modules/customers/router.js";
import { openApiRouter } from "./openapi/router.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "primebrick-api" });
});

app.get("/api/v1/modules", (_req, res) => {
  res.json({
    modules: [
      { id: "crm", name: "CRM", enabled: true },
      { id: "accounting", name: "Accounting", enabled: false },
      { id: "warehouse", name: "Warehouse", enabled: false },
    ],
  });
});

app.use(openApiRouter());
app.use(customersRouter());

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
