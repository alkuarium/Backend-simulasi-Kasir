import {
  PrismaClient
} from "@prisma/client";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();


export const getallMenu = async (req, res) => {
  try {
    const result = await prisma.menu.findMany();
    res.status(200).json({
      success: true,
      data: result
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch users ${error}`
    });
  }
}



export const getMenuById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const menu = await prisma.menu.findUnique({
      where: {
        id_menu: id
      }
    });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found"
      });
    }

    res.status(200).json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: ` Failed to fetch menu` 
    });
  }
};


export const createMenu = async (req, res) => {
  try {
    const {
      nama_menu,
      harga_menu,
      jenis_menu
    } = req.body;

    const userId = req.user.id;


    const stan = await prisma.stan.findFirst({
      where: {
        id_user_stan: userId
      }
    });

    if (!stan) {
      return res.status(404).json({
        success: false,
        message: "User belum memiliki stan"
      });
    }


    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Foto menu wajib diupload"
      });
    }

    const menu = await prisma.menu.create({
      data: {
        nama_menu,
        harga_menu: Number(harga_menu),
        foto_menu: req.file.filename,
        jenis_menu,
        id_menu_stan: stan.id_stan
      }
    });

    res.status(201).json({
      success: true,
      message: "Menu berhasil ditambahkan",
      data: menu
    });

  } catch (error) {
    console.error(error);


    if (error.message === "Only images are allowed") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Gagal menambahkan menu"
    });
  }
};



export const updateMenu = async (req, res) => {
  try {
    const idMenu = Number(req.params.id);
    const { nama_menu, harga_menu, jenis_menu } = req.body;
    const userId = req.user.id;

    const stan = await prisma.stan.findFirst({
      where: { id_user_stan: userId }
    });

    if (!stan) {
      return res.status(404).json({
        success: false,
        message: "User belum memiliki stan"
      });
    }

    const menu = await prisma.menu.findFirst({
      where: {
        id_menu: idMenu,
        id_menu_stan: stan.id_stan
      }
    });

    if (!menu) {
      return res.status(403).json({
        success: false,
        message: "Menu bukan milik anda"
      });
    }

    const dataUpdate = {
      nama_menu,
      jenis_menu
    };

    if (harga_menu !== undefined) {
      dataUpdate.harga_menu = Number(harga_menu);
    }

    if (req.file) {
      dataUpdate.foto_menu = req.file.filename;
    }

    const updated = await prisma.menu.update({
      where: { id_menu: idMenu },
      data: dataUpdate
    });

    res.status(200).json({
      success: true,
      message: "Menu berhasil diperbarui",
      data: updated
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal update menu"
    });
  }
};



export const deleteMenu = async (req, res) => {
  try {
    const idMenu = parseInt(req.params.id);
    const userId = req.user.id;

    // cek kepemilikan stan admin login
    const stan = await prisma.stan.findFirst({
      where: {
        id_user_stan: userId
      }
    });

    if (!stan) {
      return res.status(404).json({
        success: false,
        message: "User belum memiliki stan"
      });
    }

    // cek menu milik stan 
    const menu = await prisma.menu.findFirst({
      where: {
        id_menu: idMenu,
        id_menu_stan: stan.id_stan
      }
    });

    if (!menu) {
      return res.status(403).json({
        success: false,
        message: "Menu tidak ditemukan atau bukan milik anda"
      });
    }

    // hapus foto
    if (menu.foto_menu) {
      const filePath = path.join("upload", menu.foto_menu);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // hapus menu
    await prisma.menu.delete({
      where: {
        id_menu: idMenu
      }
    });

    res.status(200).json({
      success: true,
      message: "Menu berhasil dihapus"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus menu"
    });
  }
};


export const getMenuByStanId = async (req, res) => {
  try {
    const idStan = Number(req.params.id);

    if (isNaN(idStan)) {
      return res.status(400).json({
        success: false,
        message: "ID stan tidak valid"
      });
    }

  
    const stan = await prisma.stan.findUnique({
      where: { id_stan: idStan }
    });

    if (!stan) {
      return res.status(404).json({
        success: false,
        message: "Stan tidak ditemukan"
      });
    }

    // get menu + diskon ( kalo ad )
    const menus = await prisma.menu.findMany({
      where: {
        id_menu_stan: idStan
      },
      include: {
        diskon_menu: {
          include: {
            diskon: true
          }
        }
      }
    });

    const now = new Date();

    const result = menus.map(menu => {
      let persen_diskon = 0;

      menu.diskon_menu.forEach(dm => {
        const d = dm.diskon;
        if (now >= d.tanggal_mulai && now <= d.tanggal_selesai) {
          persen_diskon = Math.max(persen_diskon, d.persen_diskon);
        }
      });

      const harga_asli = menu.harga_menu;
      const harga_setelah_diskon =
        persen_diskon > 0
          ? Math.round(harga_asli - (harga_asli * persen_diskon / 100))
          : harga_asli;

      return {
        id_menu: menu.id_menu,
        nama_menu: menu.nama_menu,
        jenis_menu: menu.jenis_menu,
        foto_menu: menu.foto_menu,

        harga_asli,
        persen_diskon,
        harga_setelah_diskon,

        createdAt: menu.createdAt,
        updatedAt: menu.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil menu stan"
    });
  }
};




export const getMenuByStan = async (req, res) => {
  try {
    const userId = req.user.id;

    const stan = await prisma.stan.findFirst({
      where: { id_user_stan: userId }
    });

    if (!stan) {
      return res.status(404).json({
        success: false,
        message: "Stan tidak ditemukan"
      });
    }

    const menus = await prisma.menu.findMany({
      where: {
        id_menu_stan: stan.id_stan
      },
      include: {
        diskon_menu: {
          include: {
            diskon: true
          }
        }
      }
    });

    const now = new Date();

    const result = menus.map(menu => {
      let persen_diskon = 0;

      // cek diskon dari yg terbesar
      menu.diskon_menu.forEach(dm => {
        const d = dm.diskon;
        if (now >= d.tanggal_mulai && now <= d.tanggal_selesai) {
          persen_diskon = Math.max(persen_diskon, d.persen_diskon);
        }
      });

      const harga_asli = menu.harga_menu;
      const harga_setelah_diskon =
        persen_diskon > 0
          ? Math.round(harga_asli - (harga_asli * persen_diskon / 100))
          : harga_asli;

      return {
        id_menu: menu.id_menu,
        nama_menu: menu.nama_menu,
        jenis_menu: menu.jenis_menu,
        foto_menu: menu.foto_menu,

        harga_asli,
        persen_diskon,
        harga_setelah_diskon,

        createdAt: menu.createdAt,
        updatedAt: menu.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil menu"
    });
  }
};


