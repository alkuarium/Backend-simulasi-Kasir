import express from "express";
import { upload } from "../middleware/upload.js";

import {
    getallStan,
    getStanById,
    createStan,
    updateStan,
    deleteStan
} from "../controller/stan.js";


import { authenticate, authorize } from '../controller/auth.js'
import { admin, siswa, admin_stan, adsis, adstan} from '../middleware/role_validation.js'

const app = express();
app.use(express.json())

app.get("/stanID/:id", authorize,admin, getStanById);
app.get("/stanALL", authorize, adsis, getallStan);
app.post("/createstan", authorize, adstan, upload.none(), createStan);
app.put("/updatestan/:id", authorize, adstan, upload.none(), updateStan);
app.delete("/deletestan/:id", authorize, adstan, deleteStan);





export default app;