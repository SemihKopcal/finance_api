# 💰 Financial Management API

Modern finansal yönetim uygulaması için RESTful API. Gelir-gider takibi, kategori yönetimi, detaylı raporlama ve kullanıcı kimlik doğrulama özellikleri içerir.

## 🚀 Özellikler

- **🔐 Kullanıcı Yönetimi**: JWT tabanlı kimlik doğrulama
- **💰 İşlem Takibi**: Gelir ve gider kayıtları
- **📊 Kategori Yönetimi**: Özelleştirilebilir kategoriler
- **📈 Raporlama**: Detaylı finansal analizler
- **✅ Validation**: Kapsamlı veri doğrulama
- **📚 Swagger**: Otomatik API dokümantasyonu
- **🗄️ MongoDB**: NoSQL veritabanı desteği
- **🔒 Güvenlik**: CORS, rate limiting, input sanitization

## 🛠️ Teknolojiler

- **Backend**: Node.js + Express.js
- **Dil**: TypeScript
- **Veritabanı**: MongoDB + Mongoose
- **Kimlik Doğrulama**: JWT + bcrypt
- **Validation**: express-validator
- **Dokümantasyon**: Swagger/OpenAPI
- **Paket Yöneticisi**: pnpm

## 🚀 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/SemihKopcal/finance_api
cd test_case
```

### 2. Bağımlılıkları Yükleyin

```bash
pnpm install
```

### 3. Environment Variables

`.env` dosyası oluşturun:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/test_case

# Server Configuration
PORT=3001

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Environment
NODE_ENV=development
```

### 4. MongoDB'yi Başlatın

MongoDB servisini başlatın veya Docker kullanın:

```bash
# Docker ile MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Uygulamayı Başlatın

```bash
# Development modunda
pnpm run dev

# Production build
pnpm run build
pnpm start
```

## 📁 Proje Yapısı

```
src/
├── auth/                 # Kullanıcı kimlik doğrulama
│   ├── auth.controller.ts
│   ├── auth.middleware.ts
│   ├── auth.route.ts
│   ├── auth.service.ts
│   └── entities/
├── categories/           # Kategori yönetimi
│   ├── categories.controller.ts
│   ├── categories.route.ts
│   ├── categories.service.ts
│   └── entities/
├── transactions/         # İşlem yönetimi
│   ├── transactions.controller.ts
│   ├── transactions.route.ts
│   ├── transactions.service.ts
│   └── entities/
├── reports/             # Raporlama
│   ├── reports.controller.ts
│   ├── reports.route.ts
│   └── reports.service.ts
├── middleware/          # Middleware'ler
│   └── validation.middleware.ts
├── db.ts               # Veritabanı bağlantısı
├── swagger.ts          # API dokümantasyonu
└── index.ts            # Ana uygulama
```

## 🔌 API Endpoints

### 🔐 Kimlik Doğrulama

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/auth/register` | Kullanıcı kaydı |
| `POST` | `/auth/login` | Kullanıcı girişi |
| `GET` | `/auth/profile` | Profil bilgileri |
| `PUT` | `/auth/profile` | Profil güncelleme |

### 📊 Kategoriler

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/categories/defaults` | Varsayılan kategoriler |
| `GET` | `/categories` | Varsayılanlar ile birlikte kullanıcı kategorileri|
| `POST` | `/categories` | Yeni kategori oluşturma |
| `GET` | `/categories/:id` | Kategori detayı |
| `PUT` | `/categories/:id` | Kategori güncelleme |
| `DELETE` | `/categories/:id` | Kategori silme |

### 💰 İşlemler

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/transactions` | Yeni işlem oluşturma |
| `GET` | `/transactions` | İşlem listesi |
| `GET` | `/transactions/:id` | İşlem detayı |
| `PUT` | `/transactions/:id` | İşlem güncelleme |
| `DELETE` | `/transactions/:id` | İşlem silme |

### 📈 Raporlar

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/reports/summary` | Genel özet raporu |
| `GET` | `/reports/categories` | Kategori bazlı analiz |
| `GET` | `/reports/balance` | Toplam bakiye raporu |

## 🔒 Validation Kuralları

### Kullanıcı Kaydı
- **İsim**: 2-50 karakter, sadece harf ve boşluk
- **Email**: Geçerli email formatı
- **Şifre**: En az 6 karakter, 1 büyük harf, 1 küçük harf, 1 rakam

### Kategori
- **İsim**: 2-50 karakter, sadece harf ve boşluk
- **Tip**: `income` veya `expense`
- **Renk**: Hex format (#FF5733)

### İşlem
- **Tutar**: 0.01'den büyük
- **Tip**: `income` veya `expense`
- **Kategori ID**: Geçerli MongoDB ObjectId
- **Açıklama**: Maksimum 500 karakter
- **Tarih**: ISO 8601 formatı

## 🧪 Test

```bash
# Linting
pnpm run lint

# Linting + fix
pnpm run lint:fix

# Code formatting
pnpm run format
```

## 📚 API Dokümantasyonu

Uygulama çalıştıktan sonra Swagger dokümantasyonuna erişin:

```
http://localhost:3001/api-docs
```

## 🌱 Seed Data

Varsayılan kategoriler otomatik olarak uygulama başlatıldığında oluşturulur.

Manuel olarak transaction'lar oluşturmak için:

```bash
pnpm run seed:transactions
```

## 🚀 Production Deployment

### 1. Build

```bash
pnpm run build
```

### 2. Environment Variables

Production için güvenli environment variables ayarlayın:

```env
NODE_ENV=production
MONGO_URI=mongodb://your-production-mongo-uri
JWT_SECRET=your-very-secure-jwt-secret
```

### 3. Process Manager

PM2 ile uygulamayı yönetin:

```bash
npm install -g pm2
pm2 start dist/index.js --name "financial-api"
pm2 startup
pm2 save
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje [ISC](LICENSE) lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Proje**: [GitHub Repository](https://github.com/SemihKopcal/finance_api)
- **Issues**: [GitHub Issues](https://github.com/SemihKopcal/finance_api/issues)

## 🙏 Teşekkürler

Bu proje aşağıdaki açık kaynak projeleri kullanmaktadır:

- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [express-validator](https://express-validator.github.io/)
- [Swagger](https://swagger.io/)
