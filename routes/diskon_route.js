import express from "express";
import {
    createDiskon,
    getAllDiskon,
    getDiskonById,
    updateDiskon,
    deleteDiskon,
    getDiskonByStanId,
    getDiskonByMyStan,
    applyDiskonToMenu,
    removeDiskonFromMenu
} from "../controller/diskon.js";

import {
    authorize
} from "../controller/auth.js";
import {
    admin,
    admin_stan,
    siswa,
    adsis,
    adstan
} from "../middleware/role_validation.js";

const app = express.Router();
app.use(express.json());

app.get("/diskon", authorize, siswa, getAllDiskon);
app.get("/diskon/:id", authorize, siswa, getDiskonById);
app.get("/diskonStan/:id", authorize, siswa, getDiskonByStanId);
app.get("/diskonMyStan/", authorize, admin_stan, getDiskonByMyStan);
app.post("/diskon", authorize, admin_stan, createDiskon);
app.post("/apply", authorize, admin_stan, applyDiskonToMenu);
app.put("/diskon/:id", authorize, admin_stan, updateDiskon);
app.delete("/diskon/:id", authorize, admin_stan, deleteDiskon);
app.delete("/removeDiskon/:id", authorize, admin_stan, removeDiskonFromMenu);


export default app;