#!/bin/bash

# Запускаем MongoDB
mongod --fork --logpath /var/log/mongodb.log

# Ждем 5 секунд, чтобы MongoDB успела запуститься
sleep 5

# Запускаем бэкенд в фоне
cd backend && node src/index.js &

# Запускаем фронтенд
cd frontend && serve -s build -l 3000 