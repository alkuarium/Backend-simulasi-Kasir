# Backend-simulasi-Kasir
Struktur Backend untuk kasir + pelanggan -- CRUD KASIR DAN PELANGGAN

fitur :<br>
Login<br>
CRUD Kasir <br>
CRUD Pelanggan<br>
AUTH





npm init -y untuk memulai projec dan menginstal.<br>
npm i untuk menginstal semua package yang ada di file package. <br>
npm i //package yang ingin di tambahkan / di install.<br>
npx prisma init ==> untuk menginisialisasikan Prisma ORM.<br>
Perintah ini membuat folder prisma baru berisi file schema.prisma,<br>
dan file .env untuk menyimpan URL koneksi database. <br>


jika ingin menambahkan tabel di database <br>
ke file schema.prisma <== file ini wajib ada di dalam file prisma saat <br>
prisma<br>
|--schema.prisma<br>
<br>
lalu untuk menambahkan struktur tabel dalam prisma<br>
<br>
model user {<br>
//tabel yang ingin di tambahkan dalam user<br>
}<br>
<br>
lalu di terminal ketik npx prisma migrate dev,<br>
jika gagal coba ketikan npx prisma generate lalu ulangi printah sebelumnya yaitu npx prisma migrate dev. <br>



