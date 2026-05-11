# Деплой KROOKIES на Beget VPS

Эта инструкция рассчитана на простой production-деплой проекта на `Beget VPS` с такой схемой:

- `Next.js` приложение в Docker
- `PostgreSQL` в Docker
- `nginx` на сервере
- `Let's Encrypt` для HTTPS
- `Supabase Storage` остается для картинок товаров

## 1. Что купить на Beget

Для этого проекта разумный минимум:

- `2 vCPU`
- `4 GB RAM`
- `40 GB disk`
- отдельный `IPv4`

ОС: `Ubuntu 24.04 LTS` или `Ubuntu 22.04 LTS`

## 2. Что должно быть готово заранее

Нужно знать:

- домен сайта, например `krookies.ru`
- логин/пароль или SSH-ключ для сервера
- production-значения env

Особенно важно подготовить:

- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

Если используете соответствующие функции:

- `YOOKASSA_SHOP_ID`
- `YOOKASSA_SECRET_KEY`
- `YOOKASSA_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `DADATA_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`

## 3. Подключиться к серверу

```bash
ssh root@YOUR_SERVER_IP
```

Если у Beget другой пользователь, замените `root` на нужного пользователя.

## 4. Обновить сервер

```bash
apt update && apt upgrade -y
apt install -y curl git nginx certbot python3-certbot-nginx ca-certificates gnupg
```

## 5. Установить Docker

```bash
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable docker
systemctl start docker
```

Проверка:

```bash
docker --version
docker compose version
```

## 6. Залить проект на сервер

Если проект в Git:

```bash
mkdir -p /var/www
cd /var/www
git clone YOUR_REPOSITORY_URL krookies
cd krookies
```

Если проект не в Git, загрузите его другим способом в папку `/var/www/krookies`.

## 7. Создать production env

```bash
cp .env.production.example .env.production
```

Откройте файл:

```bash
nano .env.production
```

Минимальный обязательный блок:

```env
POSTGRES_DB="krookies"
POSTGRES_USER="krookies"
POSTGRES_PASSWORD="CHANGE_ME_STRONG_PASSWORD"

DATABASE_URL="postgresql://krookies:CHANGE_ME_STRONG_PASSWORD@postgres:5432/krookies"
DIRECT_URL="postgresql://krookies:CHANGE_ME_STRONG_PASSWORD@postgres:5432/krookies"

NEXT_PUBLIC_SITE_URL="https://YOUR_DOMAIN"
SITE_URL="https://YOUR_DOMAIN"
AUTH_SECRET="LONG_RANDOM_SECRET"

ADMIN_PHONE="+79690483464"
ADMIN_EMAIL="YOUR_ADMIN_EMAIL"
ADMIN_PASSWORD="STRONG_ADMIN_PASSWORD"

SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
SUPABASE_STORAGE_BUCKET="product-images"
```

Для генерации `AUTH_SECRET` можно использовать:

```bash
openssl rand -base64 32
```

## 8. Первый запуск базы и сидов

Сначала поднимите только PostgreSQL:

```bash
docker compose -f docker-compose.production.yml up -d postgres
```

Потом выполните инициализацию базы:

```bash
docker compose -f docker-compose.production.yml --profile setup run --rm setup
```

Это создаст таблицы и заполнит стартовые данные.

## 9. Поднять приложение

```bash
docker compose -f docker-compose.production.yml up -d --build app postgres
```

Проверка:

```bash
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs -f app
```

Приложение должно слушать `127.0.0.1:3000`.

Локальная проверка на сервере:

```bash
curl http://127.0.0.1:3000/api/health
```

Ожидаемый ответ:

```json
{"ok":true}
```

## 10. Настроить nginx

Скопируйте пример конфига:

```bash
cp deploy/nginx/krookies.conf.example /etc/nginx/sites-available/krookies.conf
```

Откройте его:

```bash
nano /etc/nginx/sites-available/krookies.conf
```

Замените:

- `your-domain.ru`
- `www.your-domain.ru`

Включите сайт:

```bash
ln -s /etc/nginx/sites-available/krookies.conf /etc/nginx/sites-enabled/krookies.conf
nginx -t
systemctl reload nginx
```

## 11. Подключить домен

У регистратора домена укажите:

- `A` запись на IP вашего VPS
- при необходимости `www` тоже на тот же IP

После обновления DNS проверьте:

```bash
ping YOUR_DOMAIN
```

## 12. Настроить HTTPS

Когда домен уже смотрит на сервер:

```bash
certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN
```

Потом проверьте автообновление:

```bash
systemctl status certbot.timer
```

## 13. Что проверить после публикации

Проверьте:

- главную страницу
- `/catalog`
- `/cart`
- `/checkout`
- `/login`
- `/privacy`
- `/oferta`
- `/delivery-payment`
- `/requisites`
- `/api/health`

Также отдельно:

- загрузку изображения товара в админке
- регистрацию и вход
- восстановление пароля
- создание заказа
- webhook URL для ЮKassa
- webhook URL для Telegram

## 14. Обновление проекта после изменений

Когда код обновился:

```bash
cd /var/www/krookies
git pull
docker compose -f docker-compose.production.yml up -d --build app
```

Если менялась Prisma schema:

```bash
docker compose -f docker-compose.production.yml --profile setup run --rm setup
docker compose -f docker-compose.production.yml up -d --build app
```

## 15. Полезные команды

Логи приложения:

```bash
docker compose -f docker-compose.production.yml logs -f app
```

Логи базы:

```bash
docker compose -f docker-compose.production.yml logs -f postgres
```

Перезапуск:

```bash
docker compose -f docker-compose.production.yml restart app
```

Остановка:

```bash
docker compose -f docker-compose.production.yml down
```

Остановка с удалением томов базы:

```bash
docker compose -f docker-compose.production.yml down -v
```

Используйте `down -v` только если точно понимаете, что удалите данные PostgreSQL.
