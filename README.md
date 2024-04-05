# 2D-Web-Based-CAD

> Disusun untuk memenuhi Tugas 1 IF3260 Grafika Komputer 2D Web Based CAD (Computer-Aided Design)

## Daftar Isi

- [Deskripsi Singkat](#deskripsi-singkat)
- [Struktur Program](#struktur-program)
- [Fitur Program](#fitur-program)
- [Cara Instalasi Program](#cara-instalasi-program)
- [Cara Menjalankan Program](#cara-menjalankan-program)

## Deskripsi Singkat

WebGL adalah sebuah standar web  yang memungkinkan rendering grafis 2D dan 3D dilakukan di dalam browser tanpa memerlukan plugin tambahan. Proses tersebut memanfaatkan kemampuan GPU untuk meningkatkan kinerja rendering dan interaktivitas situs web. WebGL menggunakan bahasa pemrograman JavaScript untuk mengontrol grafika yang ditampilkan dalam elemen HTML5. Pada proyek ini, dibandung sebuah aplikasi yang dapat digunakan untuk membentuk bangun-bangun sederhana serta melakukan operasi pada bangun-bangun tersebut.

## Struktur Program

```
ª   .gitignore
ª   README.md
ª   tes.txt
ª   
+---doc
ª       Tubes1_IF3260_13521056_13521094_13521100.pdf
ª       
+---src
ª   +---src
ª       ª   main copy.ts
ª       ª   main.ts
ª       ª   style.css
ª       ª   vite-env.d.ts
ª       ª   
ª       +---classes
ª       ª       line.ts
ª       ª       matrix.ts
ª       ª       point.ts
ª       ª       polygon.ts
ª       ª       rectangle.ts
ª       ª       shape.ts
ª       ª       square.ts
ª       ª       vector.ts
ª       ª       
ª       +---enum
ª       ª       shape-type.ts
ª       ª       
ª       +---interfaces
ª       ª       color.ts
ª       ª       
ª       +---shaders
ª       ª       fragment-shader.ts
ª       ª       vertex-shader.ts
ª       ª       
ª       +---utils
ª               algorithms.ts
ª               animation.ts
ª               save-load.ts
ª               tools.ts
ª               transformations.ts
ª               web-gl.ts
ª               wrapper.ts
ª               
+---test
        model1.json
        model2.json
            
```

## Fitur Program

1. Pemodelan Garis
2. Pemodelan Persegi
3. Pemodelan Persegi Panjang
4. Pemodelan Poligon
5. Transformasi Geometri
6. Pewarnaan Vertex
7. Animasi Model
8. Penyimpanan / Pengungahan Model

## Cara Instalasi Program

1. Lakukan `git clone` terhadap repository ini
2. Jalankan perintah `pnpm i ` pada terminal untuk menginstalasi dependency proyek ini.

## Cara Menjalankan Program

1. Jalankan perintah `pnpm run dev` untuk menjalankan aplikasi pada port 5173
2. Aplikasi dapat diakses pada `http://localhost:5173/` 

## Author
- 13521056 - Daniel Egiant Sitanggang
- 13521094 - Angela Livia Arumsari
- 13521100 - Alexander Jason