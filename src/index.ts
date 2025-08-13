

import express from "express";
import dotenv from "dotenv";

// Routes 
import authRoute from "./auth/auth.route" 
import categoryRoute from "./categories/categories.route"
import transactionsRoute from "./transactions/transactions.route";

import { setupSwagger } from "./swagger";


import connectDB from "./db";

dotenv.config();

// MongoDB bağlantısı
connectDB();

const app = express();
app.use(express.json());



app.use("/auth", authRoute);
app.use("/categories", categoryRoute);
app.use("/transactions", transactionsRoute);

// Swagger dokümantasyonu
setupSwagger(app);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
