// import app from "./app.js";

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import farmRoutes from "./routes/farmRoutes.js";

import plotsRouter from "./routes/plots.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api", farmRoutes);
app.use("/api", plotsRouter);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});


// create table in db using
// psql postgresql://postgres:mukul123@localhost:5432/iit
// DELETE FROM public.landmapping;
