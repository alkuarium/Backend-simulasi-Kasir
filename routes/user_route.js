import express from "express";
import { upload } from "../middleware/uploadUser.js";

import { 
    getallUser,
    getUserById,
    register,
    updateUser,
    deleteUser,
    login
 } from "../controller/user.js";


    import { authenticate, authorize } from '../controller/auth.js'
    import { admin, siswa, admin_stan,super_role } from '../middleware/role_validation.js'


const app = express();
app.use (express.json())

app.get("/userID/:id",authorize,admin, getUserById);
app.get("/userALL", authorize,admin, getallUser);
app.post("/register", upload.single("foto"), register);
app.put("/profil", upload.single("foto"), authorize, super_role, updateUser);
app.delete("/userdelete/:id", authorize, admin, deleteUser);


export default app;