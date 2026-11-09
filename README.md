# retro::blog + admin paneli

Statik blog + **bilgisayarında çalışan** bir yönetim paneli.
Panelden yazı ekleyip fotoğraf yükleyebilir, sonra tek tuşla GitHub'a gönderip
Cloudflare Pages'te yayınlatabilirsin.

---

## 1. Klasörde ne var?

```
retro-blog/
├── index.html              → ana sayfa (blog)
├── post.html               → tek yazı sayfası
├── admin.html              → YÖNETİM PANELİ (ayrı sayfa)
├── data/
│   └── posts.json          → bütün yazılar + site ayarları (veritabanın bu)
├── uploads/                → yüklediğin fotoğraflar
├── assets/
│   ├── css/style.css       → sitenin tasarımı
│   ├── css/admin.css       → panelin tasarımı
│   ├── js/main.js          → ana sayfa scripti
│   ├── js/post.js          → yazı sayfası scripti
│   ├── js/markdown.js      → yazı metnini HTML'e çevirir
│   └── js/admin.js         → panelin beyni
├── server.js               → panelin çalışması için küçük sunucu
├── package.json            → gerekli paketler
├── .env                    → ADMIN ŞİFREN (GitHub'a gitmez)
├── .env.example            → şifre örneği
└── baslat.bat              → Windows'ta çift tıkla, panel açılsın
```

---

## 2. İlk kurulum (sadece bir kere)

### a) Projeyi GitHub deponun içine koy

Cloudflare Pages senin GitHub deponu okuyor. Bu yüzden dosyaların
**deponun kök klasöründe** olmalı.

Deponu daha önce klonlamadıysan:

```bash
git clone https://github.com/KULLANICI/REPO.git
```

Sonra bu `retro-blog` klasörünün **içindeki her şeyi** klonladığın klasöre kopyala
(`index.html` doğrudan repo kökünde olacak şekilde).

> Klasörün içinde `.git` varsa ve repo zaten buysa, kopyalamana gerek yok —
> doğrudan burada çalışabilirsin.

### b) Şifreyi değiştir

`.env` dosyasını Not Defteri ile aç, şu satırı değiştir:

```
ADMIN_PASSWORD=buraya-kendi-sifren
```

### c) Paketleri kur

Klasörde terminal aç:

```bash
npm install
```

### d) Başlat

```bash
npm start
```

veya Windows'ta **`baslat.bat`** dosyasına çift tıkla.

Sonra tarayıcıda:

- **Blog:** http://localhost:3000
- **Panel:** http://localhost:3000/admin.html

---

## 3. Paneli kullanma

| Bölüm | Ne yapar |
|---|---|
| **Panel** | Özet: kaç yazı, kaç taslak, kaç fotoğraf, gönderilmemiş değişiklik |
| **Yazılar** | Arama, filtreleme, düzenleme, silme |
| **Yeni Yazı** | Başlık, URL, tarih, özet, metin, kapak fotoğrafı, etiketler |
| **Medya** | Fotoğraf yükle / sil / URL kopyala |
| **Ayarlar** | Site başlığı, slogan, hakkında metni + profil fotoğrafı |
| **Yayınla** | Değişiklikleri GitHub'a gönder, yedek al |

### Yazı yazarken

- **YAZ / ÖNİZLEME** sekmesiyle metni canlı görebilirsin.
- Metin **Markdown** kullanır. En çok işine yarayacaklar:

```
## Büyük başlık
**kalın yazı**
*italik*
- liste maddesi
1. numaralı liste
[link metni](https://ornek.com)
![fotoğraf](https://ornek.com/resim.png)
> alıntı
`satır içi kod`
```

Kod bloğu için üç ters tırnak (` ``` `) kullan.

- **Taslak** seçersen yazı sitede görünmez.
- **Ctrl + S** ile kaydedebilirsin.
- Fotoğrafı **sürükleyip kapak kutusuna bırakabilirsin**.

---

## 4. Yayınlama (siteyi güncelleme)

1. Panelde **Yayınla** sekmesine git.
2. Gönderilecek dosyaları görürsün.
3. İstersen commit mesajı yaz.
4. **GITHUB'A GÖNDER** butonuna bas.

Cloudflare Pages yaklaşık **1 dakika** içinde yeni hali yayınlar.

### "git deposu yok" hatası alırsan

Proje klasörü GitHub deposunun içinde değil demektir.
Depoyu klonla ve dosyaları oraya taşı (bkz. 2-a).

### İlk push'ta kullanıcı adı/e-posta hatası

```bash
git config --global user.name "Adın"
git config --global user.email "mail@ornek.com"
```

### Push şifre sorarsa

GitHub artık normal şifre kabul etmiyor. GitHub'da
**Settings → Developer settings → Personal access tokens** üzerinden bir token
oluştur ve şifre yerine onu kullan.

---

## 5. Sık sorulanlar

**Panel internette çalışmıyor, sadece localhost'ta çalışıyor.**
Doğru — bilerek böyle. Panel sadece senin bilgisayarında çalışır, internete
açık değildir. Böylece şifren ve düzenleme yetkisi güvende kalır.
Cloudflare'daki `admin.html` sayfası "sunucuya ulaşılamıyor" der, bu normaldir.

**Yazılar nerede tutuluyor?**
`data/posts.json` dosyasında. Bu dosya GitHub'a gider, site de onu okur.
Bozulursa diye her kayıtta `data/posts.backup.json` yedeği oluşur.

**Yedek almak istiyorum.**
Panel → Yayınla → **YEDEK İNDİR (.json)**.
Geri yüklemek için aynı yerden **YEDEKTEN GERİ YÜKLE**.

**Fotoğraflar nerede?**
`uploads/` klasöründe. Yüklediğin her fotoğraf oraya kaydedilir ve GitHub'a gönderilir.

**Şifremi unuttum.**
`.env` dosyasını aç, `ADMIN_PASSWORD=` satırını değiştir, sunucuyu yeniden başlat.

**`npm start` çalışmıyor / port dolu.**
`.env` içinde `PORT=3001` yap, `http://localhost:3001/admin.html` adresini kullan.

**HTML dosyasına çift tıklayınca site boş görünüyor.**
Normal — site verisini `fetch` ile okuyor, bunun için bir sunucu gerekir.
`npm start` ile aç, ya da yayındaki siteyi kullan.

---

## 6. Teknik notlar

- Yazılar `data/posts.json` içinde tek kaynak olarak tutulur.
- Taslak yazılar sitede **görünmez**, ancak `data/posts.json` dosyasını
  doğrudan açan biri görebilir. Gerçekten gizli içerik gerekiyorsa ayrı bir
  yapıya geçmek gerekir.
- Yerel sunucu `/data/posts.json` adresinde sadece yayındaki yazıları gösterir.
- Panel oturumu 12 saat sürer, sonra şifre tekrar sorulur.
- Fotoğraf sınırı: 8 MB, PNG / JPG / GIF / WEBP / AVIF.
