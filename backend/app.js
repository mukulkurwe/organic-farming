import express from "express";
import farmRoutes from "./routes/farmRoutes.js";

const app = express();

app.use(express.json());

app.use("/landmapping", farmRoutes);


export default app;
