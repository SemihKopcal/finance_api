# 1. Resmi Node.js image
FROM node:20-alpine

# 2. Çalışma dizinini ayarla
WORKDIR /app

# 3. package.json ve pnpm-lock.yaml kopyala
COPY package.json pnpm-lock.yaml ./

# 4. pnpm yükle ve bağımlılıkları kur (frozen-lockfile kaldırıldı)
RUN npm install -g pnpm
RUN pnpm install --no-frozen-lockfile

# 5. Tüm proje dosyalarını kopyala
COPY . .

# 6. TypeScript build
RUN pnpm run build

# 7. Uygulamayı çalıştır
CMD ["node", "dist/index.js"]

# 8. Container içindeki portu aç
EXPOSE 3018
