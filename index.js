import express from 'express'
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from 'multer';
import userRoute from "./routes/user_route.js";
import authRoute from "./routes/auth_route.js";
import stanRoute from "./routes/stan_route.js";
import menuRoute from "./routes/menu_route.js";
import diskonRoute from "./routes/diskon_route.js"; 
import transaksiRoute from "./routes/Transaksi_route.js";


const app = express();
const multerUpload = multer();

dotenv.config();

app.use(express.json());
app.use(`/user`, userRoute);
app.use(`/auth`, authRoute);
app.use(`/stan`, stanRoute);
app.use(`/menu`, menuRoute);
app.use(`/diskon`, diskonRoute);
app.use(`/transaksi`, transaksiRoute);

app.listen(process.env.APP_PORT, () => {
    console.log(`Server running on port ${process.env.APP_PORT}`);
});
const JWT_SECRET = process.env.JWT_SECRET;