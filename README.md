# LMS_BE

## Install

- nodejs v16.10.1
- docker
- mysql
- pm2

## Thứ tự

- tạo file .env theo hướng dẫn .env.example => Command: cp .env.example .env (Ubuntu)
- npm i
- sudo docker-compose up -d (Dùng để chạy database mysql và mongoDB)
- Optional: - sudo docker-compose down (Dừng chạy các container - sử dụng nếu có thay đổi file Docker compose)
- npm run start:dev
- npm run start
