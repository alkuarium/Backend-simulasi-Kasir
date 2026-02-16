import {
    PrismaClient
} from "@prisma/client";

const prisma = new PrismaClient();



export const getAllDiskon = async (req, res) => {
    try {
        const diskon = await prisma.diskon.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });

        res.status(200).json({
            success: true,
            data: diskon
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil data diskon"
        });
    }
};


export const getDiskonById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const diskon = await prisma.diskon.findUnique({
            where: {
                id_diskon: id
            }
        });

        if (!diskon) {
            return res.status(404).json({
                success: false,
                message: "Diskon tidak ditemukan"
            });
        }

        res.status(200).json({
            success: true,
            data: diskon
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil diskon"
        });
    }
};

export const createDiskon = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      nama_diskon,
      persen_diskon,
      tanggal_mulai,
      tanggal_selesai
    } = req.body;

    // cek kepemilikan stan
    const stan = await prisma.stan.findFirst({
      where: { id_user_stan: userId }
    });

    if (!stan) {
      return res.status(403).json({
        success: false,
        message: "Admin stan belum memiliki stan"
      });
    }

    const diskon = await prisma.diskon.create({
      data: {
        nama_diskon,
        persen_diskon: Number(persen_diskon),
        tanggal_mulai: new Date(tanggal_mulai),
        tanggal_selesai: new Date(tanggal_selesai),
        id_stan: stan.id_stan 
      }
    });

    res.status(201).json({
      success: true,
      message: "Diskon berhasil dibuat",
      data: diskon
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat diskon"
    });
  }
};



export const updateDiskon = async (req, res) => {
  try {
    const id_diskon = Number(req.params.id);
    const userId = req.user.id;

    const {
      nama_diskon,
      persen_diskon,
      tanggal_mulai,
      tanggal_selesai
    } = req.body;

    if (isNaN(id_diskon)) {
      return res.status(400).json({
        success: false,
        message: "ID diskon tidak valid"
      });
    }

    // cek stan admin yg login
    const stan = await prisma.stan.findFirst({
      where: { id_user_stan: userId }
    });

    if (!stan) {
      return res.status(403).json({
        success: false,
        message: "Anda bukan admin stan"
      });
    }

    // validasi kepemilikan diskon stan
    const diskon = await prisma.diskon.findFirst({
      where: {
        id_diskon,
        id_stan: stan.id_stan
      }
    });

    if (!diskon) {
      return res.status(403).json({
        success: false,
        message: "Diskon bukan milik stan anda"
      });
    }

    
    const updated = await prisma.diskon.update({
      where: { id_diskon },
      data: {
        nama_diskon,
        persen_diskon: persen_diskon !== undefined
          ? Number(persen_diskon)
          : undefined,
        tanggal_mulai: tanggal_mulai
          ? new Date(tanggal_mulai)
          : undefined,
        tanggal_selesai: tanggal_selesai
          ? new Date(tanggal_selesai)
          : undefined
      }
    });

    res.status(200).json({
      success: true,
      message: "Diskon berhasil diperbarui",
      data: updated
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal update diskon"
    });
  }
};



export const deleteDiskon = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const existing = await prisma.diskon.findUnique({
            where: {
                id_diskon: id
            }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Diskon tidak ditemukan"
            });
        }

        await prisma.diskon.delete({
            where: {
                id_diskon: id
            }
        });

        res.status(200).json({
            success: true,
            message: "Diskon berhasil dihapus"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Gagal menghapus diskon"
        });
    }
};


export const applyDiskonToMenu = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_diskon, id_menu } = req.body;

    // cek kepemilikan stan
    const stan = await prisma.stan.findFirst({
      where: { id_user_stan: userId }
    });

    if (!stan) {
      return res.status(403).json({
        success: false,
        message: "Admin stan belum memiliki stan"
      });
    }


    const diskon = await prisma.diskon.findFirst({
      where: {
        id_diskon: Number(id_diskon),
        id_stan: stan.id_stan
      }
    });

    if (!diskon) {
      return res.status(403).json({
        success: false,
        message: "Diskon bukan milik stan anda"
      });
    }

  
    const menu = await prisma.menu.findFirst({
      where: {
        id_menu: Number(id_menu),
        id_menu_stan: stan.id_stan
      }
    });

    if (!menu) {
      return res.status(403).json({
        success: false,
        message: "Menu bukan milik stan anda"
      });
    }

  
    const exist = await prisma.diskon_menu.findFirst({
      where: {
        id_diskon: Number(id_diskon),
        id_menu: Number(id_menu)
      }
    });

    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Diskon sudah diterapkan ke menu ini"
      });
    }

    
    const result = await prisma.diskon_menu.create({
      data: {
        diskon: {
          connect: { id_diskon: Number(id_diskon) }
        },
        menu: {
          connect: { id_menu: Number(id_menu) }
        },
        stan: {
          connect: { id_stan: stan.id_stan }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "Diskon berhasil diterapkan ke menu",
      data: result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal apply diskon",
      error: error.message
    });
  }
};


export const removeDiskonFromMenu = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id); 

    const stan = await prisma.stan.findFirst({
      where: { id_user_stan: userId }
    });

    if (!stan) {
      return res.status(403).json({
        success: false,
        message: "Admin stan belum memiliki stan"
      });
    }

    const relation = await prisma.diskon_menu.findUnique({
      where: { id },
      include: {
        menu: true,
        diskon: true
      }
    });

    if (
      !relation ||
      relation.menu.id_menu_stan !== stan.id_stan ||
      relation.diskon.id_stan !== stan.id_stan
    ) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak"
      });
    }

    await prisma.diskon_menu.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: "Diskon berhasil dilepas dari menu"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus diskon"
    });
  }
};



export const getDiskonByStanId = async (req, res) => {
  try {
    const idStan = parseInt(req.params.id);

    if (isNaN(idStan)) {
      return res.status(400).json({
        success: false,
        message: "ID stan tidak valid"
      });
    }

    // 🔍 Cek stan
    const stan = await prisma.stan.findUnique({
      where: { id_stan: idStan }
    });

    if (!stan) {
      return res.status(404).json({
        success: false,
        message: "Stan tidak ditemukan"
      });
    }

    // 📦 Ambil diskon yang dipakai menu stan
    const diskon = await prisma.diskon.findMany({
      where: {
        diskon_menu: {
          some: {
            menu: {
              id_menu_stan: idStan
            }
          }
        }
      },
      distinct: ["id_diskon"], // ⛔ hindari duplikasi
      orderBy: {
        createdAt: "desc"
      }
    });

    res.status(200).json({
      success: true,
      data: diskon
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil diskon stan"
    });
  }
};


export const getDiskonByMyStan = async (req, res) => {
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

    const diskon = await prisma.diskon.findMany({
      where: {
        id_stan: stan.id_stan
      },
      orderBy: {
        id_diskon: "desc"
      }
    });

    res.status(200).json({
      success: true,
      data: diskon
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil diskon stan"
    });
  }
};


