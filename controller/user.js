import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";


const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

//get all users
export const getallUser = async (req, res) => {
    try {
        const result = await prisma.user.findMany();
        res.status(200).json({
            success: true,
            data: result
    })

}catch (error) {
    console.log (error);
    res.status(500).json({
        success: false,
        message: `Failed to fetch users ${error}`
    });
 }
  

}



//find user by id
export const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await prisma.user.findUnique({
      where: {
        id_user: id
      }
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to find user by id"
    });
  }
};






//create user
export const register = async (req, res) => {
  try {
    const { name, email, password, alamat, noTelp, role } = req.body;



     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid"
      });
    }

    
    const exist = await prisma.user.findUnique({
      where: { email }
    });

    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const foto = req.file ? req.file.filename : null;

    const result = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        alamat,
        noTelp,
        role,
        foto
      }
    });

    res.status(200).json({
      success: true,
      data: result,
      massage: `token : ${jwt.sign({ id: result.id }, JWT_SECRET, { expiresIn: "1d" })}`
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Failed to create user, kolom tidak boleh kosong ${error}`
    });
  }
};





//update user
export const updateUser = async (req, res) => {
  try {

    const userId = req.user.id;

    const existingUser = await prisma.user.findUnique({
      where: { id_user: userId }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    const { name, email, password, alamat, noTelp } = req.body;
    const foto = req.file ? req.file.filename : undefined;

    const data = {};

    if (name && name !== existingUser.name) data.name = name;
    if (alamat && alamat !== existingUser.alamat) data.alamat = alamat;
    if (noTelp && noTelp !== existingUser.noTelp) data.noTelp = noTelp;

    if (email && email !== existingUser.email) {
      const emailUsed = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id_user: userId }
        }
      });

      if (emailUsed) {
        return res.status(400).json({
          success: false,
          message: "Email sudah digunakan"
        });
      }

      data.email = email;
    }

   //hash pw
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    if (foto) {
      data.foto = foto;
    }

    if (Object.keys(data).length === 0) {
      return res.status(200).json({
        success: true,
        message: "Tidak ada perubahan",
        data: existingUser
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id_user: userId },
      data
    });

    
    const { password: _, ...safeUser } = updatedUser;

    res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: safeUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui profil"
    });
  }
};






//Delete user
export const deleteUser = async (req, res) => {
  try {
    
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id"
      });
    }

    
    const existingUser = await prisma.user.findUnique({
      where: { id_user: id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    
    if (req.user && req.user.id === id) {
      return res.status(400).json({
        message: "You cannot delete your own account"
      });
    }

    
    await prisma.user.delete({
      where: {
        id_user: id
      }
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete user"
    });
  }
};



//login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cek email di body
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "email and password are required"
            });
        }

        // Cari user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        // Jika user tidak ditemukan
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "email not found"
            });
        }

        // Cek password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({
                success: false,
                message: "invalid password"
            });
        }

        // JWT_SECRET dari .env
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            success: true,
            message: "login successful",
            token : token
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "server error",
            error: error.message
        });
    }
};