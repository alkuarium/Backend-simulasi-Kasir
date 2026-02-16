import {
  PrismaClient
} from "@prisma/client";

const prisma = new PrismaClient();



export const getallStan = async (req, res) => {
  try {
    const result = await prisma.stan.findMany();
    res.status(200).json({
      success: true,
      data: result
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch stan ${error}`
    });
  }
}



export const getStanById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const stan = await prisma.stan.findUnique({
      where: {
        id_stan: id
      }
    });

    if (!stan) {
      return res.status(404).json({
        success: false,
        message: "Stan not found"
      });
    }

    res.status(200).json({
      success: true,
      data: stan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to find stan by id"
    });
  }
};





export const createStan = async (req, res) => {
  try {
    const {
      nama_stan,
      telp_stan
    } = req.body;
    const id_user_stan = req.user.id;


    const user = await prisma.user.findUnique({
      where: {
        id_user: id_user_stan
      },
      select: {
        name: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }


    const existingStan = await prisma.stan.findFirst({
      where: {
        id_user_stan
      }
    });

    if (existingStan) {
      return res.status(403).json({
        success: false,
        message: "User sudah memiliki stan"
      });
    }

    const result = await prisma.stan.create({
      data: {
        nama_stan,
        nama_pemilik: user.name,
        telp_stan,
        id_user_stan
      }
    });

    res.status(201).json({
      success: true,
      message: "Stan created successfully",
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create stan"
    });
  }
};





export const updateStan = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      nama_stan,
      telp_stan
    } = req.body;
    const userId = req.user.id;


    const stan = await prisma.stan.findFirst({
      where: {
        id_stan: id,
        id_user_stan: userId
      }
    });

    if (!stan) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke stan ini"
      });
    }

    const updatedStan = await prisma.stan.update({
      where: {
        id_stan: id
      },
      data: {
        nama_stan,
        telp_stan
      }
    });

    res.status(200).json({
      success: true,
      message: "Stan updated successfully",
      data: updatedStan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update stan"
    });
  }
};



export const deleteStan = async (req, res) => {
  try {
    const idStan = Number(req.params.id);
    const userId = req.user.id;

    if (isNaN(idStan)) {
      return res.status(400).json({
        success: false,
        message: "ID stan tidak valid"
      });
    }

    // validasi kepemilikan stan
    const stan = await prisma.stan.findFirst({
      where: {
        id_stan: idStan,
        id_user_stan: userId
      }
    });

    if (!stan) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke stan ini"
      });
    }

    // hapus data yang berkorelasi
    await prisma.diskon_menu.deleteMany({
      where: {
        id_stan: idStan
      }
    });

    await prisma.diskon.deleteMany({
      where: {
        id_stan: idStan
      }
    });

    await prisma.menu.deleteMany({
      where: {
        id_menu_stan: idStan
      }
    });

   
    // await prisma.transaksi.deleteMany({ where: { id_stan: idStan } });

    
    await prisma.stan.delete({
      where: {
        id_stan: idStan
      }
    });

    res.status(200).json({
      success: true,
      message: "Stan dan seluruh data terkait berhasil dihapus"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus stan",
      error: error.message
    });
  }
};