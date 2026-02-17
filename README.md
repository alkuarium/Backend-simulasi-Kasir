# Backend-simulasi-Kasir
Struktur Backend untuk kasir + pelanggan -- CRUD KASIR DAN PELANGGAN

fitur :
Login
CRUD Kasir
CRUD Pelanggan
AUTH





npm init -y untuk memulai projec dan menginstal.
npm i untuk menginstal semua package yang ada di file package. 
npm i //package yang ingin di tambahkan / di install.
npx prisma init ==> untuk menginisialisasikan Prisma ORM.
Perintah ini membuat folder prisma baru berisi file schema.prisma,
dan file .env untuk menyimpan URL koneksi database. 


jika ingin menambahkan tabel di database 
ke file schema.prisma <== file ini wajib ada di dalam file prisma saat 
prisma
|--schema.prisma

lalu untuk menambahkan struktur tabel dalam prisma

model user {
//tabel yang ingin di tambahkan dalam user
}

lalu di terminal ketik npx prisma migrate dev,
jika gagal coba ketikan npx prisma generate lalu ulangi printah sebelumnya yaitu npx prisma migrate dev. 



