# Steam Playtime Dashboard

Steam kütüphanenizdeki oyunları, tüm zamanlar ve son iki haftadaki oynama süresiyle tek bir koyu temalı panelde gösteren yerel web uygulaması.

## Gereksinimler

- Node.js 18 veya üstü (npm paketi gerekmez)
- Steam Web API anahtarı
- Herkese açık Steam profiliniz ve SteamID64
- İlk yükleme için internet bağlantısı

## Kurulum ve çalıştırma

1. Bu klasörü bilgisayarınıza indirin veya kopyalayın.
2. Node.js kurulu olduğundan emin olun: `node --version`
3. Bu klasörde terminal açıp `node server.mjs` komutunu çalıştırın. Alternatif olarak `npm start` kullanabilirsiniz.
4. Tarayıcıda `http://127.0.0.1:4173` adresini açın.
5. **Steam’e bağlan** düğmesine tıklayıp API key ve SteamID64 bilgilerinizi girin.

### Windows uygulaması gibi yükleme

Paneli Chrome veya Edge'de açtıktan sonra adres çubuğundaki **Uygulamayı yükle** simgesini ya da tarayıcı menüsündeki **Uygulamayı yükle / Install app** seçeneğini kullanın. Bu, paneli sekmesiz ve kendi penceresinde açar; Windows Başlat menüsüne ekler. Masaüstü kısayolu için tarayıcının yükleme penceresinde ilgili seçeneği işaretleyin veya Başlat menüsünde Steam Playtime'a sağ tıklayıp **Dosya konumunu aç** deyin ve kısayolu masaüstüne kopyalayın.

Steam API verilerini almak için arka uç sunucusunun çalışması gerekir. Masaüstündeki `Steam Playtime.lnk` kısayolu sunucuyu gizli olarak başlatır. PWA penceresini kurduktan sonra başlatmak için aynı masaüstü kısayolunu kullanabilirsiniz.

Sunucu varsayılan olarak yalnızca bu bilgisayardan erişilebilen `127.0.0.1` adresinde dinler. Portu değiştirmek isterseniz, sunucuyu başlatmadan önce `PORT=5000` (PowerShell: `$env:PORT=5000`) ayarlayın ve `http://127.0.0.1:5000` adresini açın.

## Steam API key alma

1. Steam hesabınızda oturum açın ve [Steam Web API Key sayfasını](https://steamcommunity.com/dev/apikey) açın.
2. Alan adı sorulursa `localhost` yazıp şartları onaylayın. Görüntülenen anahtarı uygulamadaki API Key alanına girin.
3. SteamID64 için profilinizin URL’sindeki 17 haneli sayıyı kullanın. Özel profil URL’niz varsa [SteamID Finder](https://steamid.io/) benzeri bir araçta profil URL’nizi aratıp SteamID64 değerini alın.
4. Steam profilinizde **Oyun ayrıntıları** görünürlüğünü **Herkese Açık** yapın. Aksi takdirde sahip olunan oyun listesi API’den alınamaz.

## Özellikler

- Steam `IPlayerService/GetOwnedGames` endpoint’inden sahip olunan oyunlar
- Oyun adı, Steam oyun ikonu, toplam süre ve API sağlıyorsa son iki haftanın süresi
- Oyun adedi ve toplam/son iki hafta saatlerini gösteren özet kartları
- En çok oynanan 8 oyun için grafik
- Oyun adına göre arama, oynama süresine göre artan/azalan sıralama, liste/kart görünümü
- Mobil ekranlara uyumlu koyu tema
- API anahtarı veya SteamID geçersiz, profil gizli, Steam rate limit’i veya bağlantı hatası için açıklayıcı mesajlar

## Gizlilik ve güvenlik

API key ve SteamID64 uygulama koduna gömülmez; kaydedildiklerinde yalnızca bu tarayıcının `localStorage` alanında saklanır. Kütüphane yüklenirken bilgiler, aynı bilgisayarda çalışan Node sunucusuna localhost üzerinden iletilir. Sunucu Steam API isteğini yapar, anahtarı diske kaydetmez ve API yanıtından sonra anahtar içeren URL’yi veya isteği loglamaz. Yerel tarayıcı profilinize erişebilen kişiler localStorage kaydınızı görebileceğinden, ortak bilgisayarda bağlantıyı kullandıktan sonra ayarlardan bilgileri silin.

API key’i başkalarıyla paylaşmayın ve bu yerel uygulamayı internete açık bir sunucuya olduğu gibi dağıtmayın. Bu sürüm tek kullanıcının kendi bilgisayarında yerel kullanım içindir.

## Veri ve sınırlar

- Endpoint: `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/`
- Steam son iki hafta dakikasını yalnızca API alanı döndürdüğünde gösterir; sunulmayan değer `—` olarak gösterilir.
- Oyun görselleri Steam’in CDN’inden yüklenir. Bazı oyunlarda ikon yoksa simge yedeği görünür.
- Bazı oyunlar oynama süresi gizliliği veya Steam API kısıtları nedeniyle listede görünmeyebilir.
- Veriler her açılışta Steam’den yeniden alınır; uygulama arka uçta oyun listesi saklamaz.

## Sorun giderme

- **API key biçimi geçersiz:** Steam sayfasındaki 32 karakterli anahtarı başında/sonunda boşluk olmadan girin.
- **Kütüphane alınamadı:** Steam profilinizin Oyun ayrıntıları görünürlüğünü herkese açık yapın; doğru kullanıcıya ait 17 haneli SteamID64 kullandığınızı kontrol edin.
- **Rate limit:** Birkaç dakika bekleyip yenileyin.
- **Steam API’ye bağlanılamadı:** İnternet bağlantısını kontrol edin; Steam API geçici olarak yanıt vermiyor olabilir.
- **Sayfa açılmıyor:** Terminalde sunucunun çalıştığını ve `http://127.0.0.1:4173` adresini kullandığınızı kontrol edin. Sunucuyu durdurmak için terminalde `Ctrl+C` basın.
