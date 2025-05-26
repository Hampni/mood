# Этап 1: Сборка фронтенда
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Этап 2: Сборка бэкенда
FROM node:18 AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Этап 3: Финальный образ
FROM mongo:7.0

# Устанавливаем Node.js
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Устанавливаем serve для раздачи статики
RUN npm install -g serve

# Копируем собранный фронтенд
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Копируем бэкенд
COPY --from=backend-build /app/backend ./backend

# Устанавливаем зависимости для продакшена
WORKDIR /app/backend
RUN npm install --production

# Создаем скрипт запуска
RUN echo '#!/bin/bash\n\
# Запускаем MongoDB\n\
mongod --fork --logpath /var/log/mongodb.log\n\
\n\
# Запускаем бэкенд в фоне\n\
cd /app/backend && node src/index.js &\n\
\n\
# Запускаем фронтенд\n\
cd /app && serve -s frontend/build -l 3000\n\
' > /app/start.sh

RUN chmod +x /app/start.sh

# Открываем порты
EXPOSE 3000 4000 27017

# Запускаем всё
CMD ["/app/start.sh"] 