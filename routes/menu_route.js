import express from "express";
import { upload } from "../middleware/uploadMenu.js";

import {
    getallMenu,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    getMenuByStanId,
    getMenuByStan
} from "../controller/menu.js";


import { authenticate, authorize } from '../controller/auth.js'
import { siswa, admin_stan} from '../middleware/role_validation.js'

const app = express();
app.use(express.json())

app.get("/menuALL", authorize, siswa, getallMenu);
app.get("/menuID/:id", authorize,siswa, getMenuById);
app.post("/menuCreate",authorize,admin_stan,upload.single("foto_menu"), createMenu);
app.put("/updatemenu/:id", authorize, admin_stan, upload.single("foto_menu"), updateMenu);
app.delete("/deletemenu/:id", authorize, admin_stan, deleteMenu);
app.get("/menuStan/:id", authorize, siswa, getMenuByStanId);
app.get("/menuMyStan", authorize, admin_stan, getMenuByStan);





export default app;