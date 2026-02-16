import express from "express";
import {
    upload
} from "../middleware/upload.js";

import {
    getMyTransaksi,
    createTransaksi,
    getTransaksiById,
    getTransaksiByStan,
    updateStatusTransaksi,
    deleteTransaksi,
    downloadTransaksiPDF,
    TransaksiBulanan,
    rekapBulanan
} from "../controller/transaksi.js";

import {
    authenticate,
    authorize
} from '../controller/auth.js'
import { verifyToken } from "../middleware/verifyToken.js";
import {
    admin,
    siswa,
    admin_stan,
    adsis,
    adstan
} from '../middleware/role_validation.js'

const app = express();
app.use(express.json())

app.get("/transaksi/my", authorize, siswa, getMyTransaksi);
app.post("/transaksi", authorize, siswa, createTransaksi);
app.get("/transaksi/:id", authorize, getTransaksiById);
app.get("/transaksi/stan/all", authorize, admin_stan, getTransaksiByStan);
app.put("/transaksi/:id/status", authorize, admin_stan, updateStatusTransaksi);
app.delete("/transaksi/:id", authorize, admin, deleteTransaksi);
app.get("/download/:id", verifyToken,authorize,siswa, downloadTransaksiPDF);
app.post("/bulan", verifyToken,authorize,siswa,TransaksiBulanan)
app.post("/bulan/rekap", verifyToken,authorize,admin_stan, rekapBulanan)



export default app;