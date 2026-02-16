import {
  PrismaClient
} from "@prisma/client";
import PDFDocument from "pdfkit";




const prisma = new PrismaClient();




export const getMyTransaksi = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (role !== "siswa") {
      return res.status(403).json({
        success: false,
        message: "Hanya siswa yang dapat melihat transaksi pribadi"
      });
    }

    const transaksi = await prisma.transaksi.findMany({
      where: {
        id_user: userId
      },
      include: {
        Stan: true,
        detailTransaksi: {
          include: {
            menu: true
          }
        }
      },
      orderBy: {
        id: "desc"
      }
    });

    res.status(200).json({
      success: true,
      data: transaksi
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil transaksi saya"
    });
  }
};


export const createTransaksi = async (req, res) => {
  try {
    const id_user = req.user.id;
    const {
      id_stan,
      items
    } = req.body;

    if (!id_stan || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data transaksi tidak lengkap"
      });
    }

    let total_harga = 0;
    const now = new Date();

    const detail = await Promise.all(
      items.map(async ({
        id_menu,
        qty
      }) => {
        const menu = await prisma.menu.findFirst({
          where: {
            id_menu,
            id_menu_stan: id_stan
          },
          include: {
            diskon_menu: {
              include: {
                diskon: true
              }
            }
          }
        });

        if (!menu) {
          throw new Error("Menu tidak ditemukan atau bukan milik stan ini");
        }


        let harga_final = menu.harga_menu;
        let persen_diskon = 0;

        menu.diskon_menu.forEach(dm => {
          const d = dm.diskon;
          if (now >= d.tanggal_mulai && now <= d.tanggal_selesai) {
            persen_diskon = Math.max(persen_diskon, d.persen_diskon);
          }
        });

        if (persen_diskon > 0) {
          harga_final = Math.round(
            menu.harga_menu - (menu.harga_menu * persen_diskon / 100)
          );
        }

        total_harga += harga_final * qty;

        return {
          id_menu,
          qty,
          harga_beli: harga_final
        };
      })
    );

    const transaksi = await prisma.transaksi.create({
      data: {
        id_stan,
        id_user,
        detailTransaksi: {
          create: detail
        }
      },
      include: {
        detailTransaksi: {
          include: {
            menu: true
          }
        },
        Stan: true
      }
    });

    res.status(201).json({
      success: true,
      message: "Transaksi berhasil dibuat",
      data: {
        transaksi,
        total_harga
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getTransaksiById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const transaksi = await prisma.transaksi.findUnique({
      where: {
        id
      },
      include: {
        detailTransaksi: {
          include: {
            menu: true
          }
        }
      }
    });

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan"
      });
    }

    if (req.user.role == "siswa" && transaksi.id_user != req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak"
      });
    }

    res.json({
      success: true,
      data: transaksi
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil transaksi"
    });
  }
};

export const getTransaksiByStan = async (req, res) => {
  try {
    const userId = req.user.id;

    const stan = await prisma.stan.findFirst({
      where: {
        id_user_stan: userId
      }
    });

    if (!stan) {
      return res.status(403).json({
        success: false,
        message: "Anda bukan admin stan"
      });
    }

    const transaksi = await prisma.transaksi.findMany({
      where: {
        id_stan: stan.id_stan
      },
      include: {
        User: true,
        detailTransaksi: {
          include: {
            menu: true
          }
        }
      },
      orderBy: {
        id: "desc"
      }
    });

    res.status(200).json({
      success: true,
      data: transaksi
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil transaksi"
    });
  }
};


export const updateStatusTransaksi = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      status
    } = req.body;
    const userId = req.user.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status wajib diisi"
      });
    }

    const stan = await prisma.stan.findFirst({
      where: {
        id_user_stan: userId
      }
    });

    if (!stan) {
      return res.status(403).json({
        success: false,
        message: "Anda bukan admin stan"
      });
    }

    const transaksi = await prisma.transaksi.findFirst({
      where: {
        id,
        id_stan: stan.id_stan
      }
    });

    if (!transaksi) {
      return res.status(403).json({
        success: false,
        message: "Transaksi bukan milik stan anda"
      });
    }

    const updated = await prisma.transaksi.update({
      where: {
        id
      },
      data: {
        status
      }
    });

    res.status(200).json({
      success: true,
      message: "Status transaksi berhasil diperbarui",
      data: updated
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui status transaksi"
    });
  }
};

export const deleteTransaksi = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.detailTransaksi.deleteMany({
      where: {
        id_transaksi: id
      }
    });

    await prisma.transaksi.delete({
      where: {
        id
      }
    });

    res.json({
      success: true,
      message: "Transaksi berhasil dihapus"
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Gagal menghapus transaksi"
    });
  }
};


export const downloadTransaksiPDF = async (req, res) => {
  try {
    const userId = req.user.id; // 🔐 dari JWT
    const transaksiId = Number(req.params.id); // ID transaksi dari URL

    // 🔥 FILTER PALING PENTING
    const transaksi = await prisma.transaksi.findFirst({
      where: {
        id: transaksiId,
        id_user: userId // ❗ HANYA MILIK USER LOGIN
      },
      include: {
        detailTransaksi: {
          include: {
            menu: true
          }
        },
        Stan: true
      }
    });

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan"
      });
    }

    const totalHarga = transaksi.detailTransaksi.reduce(
      (sum, item) => sum + item.qty * item.harga_beli,
      0
    );

    // ===== HEADER RESPONSE =====
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="transaksi-${transaksi.id_transaksi}.pdf"`
    );

    const doc = new PDFDocument({
      margin: 50
    });
    doc.pipe(res);

    // ===== PDF CONTENT =====
    doc.fontSize(18).text("STRUK TRANSAKSI", {
      align: "center"
    });
    doc.moveDown();

    doc.fontSize(12).text(`ID Transaksi : ${transaksi.id_transaksi}`);
    doc.text(`Stan         : ${transaksi.Stan.nama_stan}`);
    doc.text(`Tanggal      : ${new Date(transaksi.createdAt).toLocaleString()}`);
    doc.moveDown();

    // Table Header
    doc.text("No", 50);
    doc.text("Menu", 90);
    doc.text("Qty", 280);
    doc.text("Harga", 330);
    doc.text("Subtotal", 430);

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Table Data
    transaksi.detailTransaksi.forEach((item, index) => {
      doc.moveDown();
      doc.text(index + 1, 50);
      doc.text(item.menu.nama_menu, 90);
      doc.text(item.qty, 280);
      doc.text(`Rp ${item.harga_beli.toLocaleString()}`, 330);
      doc.text(
        `Rp ${(item.qty * item.harga_beli).toLocaleString()}`,
        430
      );
    });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown();
    doc.fontSize(12).text(
      `TOTAL BAYAR : Rp ${totalHarga.toLocaleString()}`, {
        align: "right"
      }
    );

    doc.moveDown(2);
    doc.fontSize(10).text("Terima kasih telah bertransaksi", {
      align: "center"
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal download transaksi"
    });
  }
};


export const TransaksiBulanan = async (req, res) => {
  try {
    const userId = req.user.id;

    // Cek apakah user ada
    const user = await prisma.user.findFirst({
      where: {
        id_user: userId
      }
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    // Ambil nama bulan dari request body (POST method)
    const { bulan } = req.body;

    if (!bulan) {
      return res.status(400).json({
        success: false,
        message: "Nama bulan harus diisi"
      });
    }

    // Mapping nama bulan ke angka
    const namaBulanMap = {
      "januari": 1,
      "februari": 2,
      "maret": 3,
      "april": 4,
      "mei": 5,
      "juni": 6,
      "juli": 7,
      "agustus": 8,
      "september": 9,
      "oktober": 10,
      "november": 11,
      "desember": 12
    };

    const bulanLowerCase = bulan.toLowerCase();
    const bulanAngka = namaBulanMap[bulanLowerCase];

    if (!bulanAngka) {
      return res.status(400).json({
        success: false,
        message: "Nama bulan tidak valid. Gunakan: Januari, Februari, Maret, April, Mei, Juni, Juli, Agustus, September, Oktober, November, atau Desember"
      });
    }

    const now = new Date();
    const tahunSekarang = now.getFullYear();

    // Nama bulan untuk response
    const namaBulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    // Buat rentang tanggal untuk filter
    const startDate = new Date(tahunSekarang, bulanAngka - 1, 1);
    const endDate = new Date(tahunSekarang, bulanAngka, 0, 23, 59, 59, 999);

    // Query transaksi dengan filter bulan dan hanya milik user yang login
    const transaksi = await prisma.transaksi.findMany({
      where: {
        id_user: userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        Stan: true,
        detailTransaksi: {
          include: {
            menu: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Cek jika tidak ada transaksi di bulan tersebut
    if (transaksi.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Tidak ada transaksi ditemukan pada bulan ${namaBulan[bulanAngka - 1]} ${tahunSekarang}`
      });
    }

    // Jika ada transaksi, return data
    res.status(200).json({
      success: true,
      periode: {
        bulan: bulanAngka,
        namaBulan: namaBulan[bulanAngka - 1],
        tahun: tahunSekarang
      },
      total: transaksi.length,
      data: transaksi
    });

  } catch (error) {
    console.error("Error TransaksiBulanan:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil transaksi",
      error: error.message
    });
  }
};



export const rekapBulanan = async (req, res) => {
  try {
    const bulanMap = {
      januari: 0,
      februari: 1,
      maret: 2,
      april: 3,
      mei: 4,
      juni: 5,
      juli: 6,
      agustus: 7,
      september: 8,
      oktober: 9,
      november: 10,
      desember: 11
    };

    const { bulan, tahun } = req.body;

    if (!bulan) {
      return res.status(400).json({
        message: "Field bulan wajib diisi (contoh: Januari)"
      });
    }

    const bulanIndex = bulanMap[bulan.toLowerCase()];

    if (bulanIndex === undefined) {
      return res.status(400).json({
        message: "Nama bulan tidak valid"
      });
    }

    const tahunDipakai = tahun || new Date().getFullYear();

    const startDate = new Date(tahunDipakai, bulanIndex, 1);
    const endDate = new Date(tahunDipakai, bulanIndex + 1, 0, 23, 59, 59);

    const transaksi = await prisma.transaksi.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        detailTransaksi: true
      }
    });

    let totalTransaksi = transaksi.length;
    let totalItem = 0;
    let totalOmzet = 0;

    transaksi.forEach(t => {
      t.detailTransaksi.forEach(d => {
        totalItem += d.qty;
        totalOmzet += d.qty * d.harga_beli;
      });
    });

    res.json({
      bulan,
      tahun: tahunDipakai,
      totalTransaksi,
      totalItem,
      totalOmzet
    });

  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil rekap bulanan",
      error: error.message
    });
  }
};





