FROM node:20-alpine

# Çalışma dizini
WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY package*.json ./
RUN npm install

# Kaynak kodları kopyala
COPY . .

# Port
EXPOSE 3000

# Geliştirme modunda başlat
CMD ["npm", "run", "dev"]