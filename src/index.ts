

import express from "express";
import dotenv from "dotenv";

// Routes 
import authRoute from "./auth/auth.route" 


import connectDB from "./db";

dotenv.config();

// MongoDB bağlantısı
connectDB();

const app = express();
app.use(express.json());

app.use("/auth", authRoute);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
