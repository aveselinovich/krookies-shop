# KROOKIES Shop Full

Полная версия интернет-магазина KROOKIES

## Что внутри

- Главная, каталог, карточки товаров, корзина, checkout
- Создание заказа-заявки: клиент не платит сразу
- Админка `/admin`: статистика, заказы, детальная карточка заказа, управление товарами
- Личный кабинет `/account`: список и детали заказов клиента
- Регистрация и вход клиента по почте и паролю
- Вход сотрудников через `/staff-login`
- Яндекс Доставка заложена как ручной процесс: менеджер оформляет доставку отдельно и отправляет клиенту отдельную ссылку

## Быстрый запуск

1. Установить зависимости:

```bash
npm install
```

2. Создать `.env` из примера:

```bash
cp .env.example .env
```

3. Указать `DATABASE_URL` для PostgreSQL.

4. Создать таблицы и наполнить товары:

```bash
npm run prisma:deploy
npx prisma db seed
```

5. Запустить проект:

```bash
npm run dev
```

6. Открыть:

```text
http://localhost:3000
```

Для существующей production-базы, ранее созданной через `db push`, сначала сделайте backup,
добавьте новое поле и один раз отметьте начальную миграцию как baseline:

```bash
psql "$DATABASE_URL" -c 'ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT'
psql "$DATABASE_URL" -c 'CREATE UNIQUE INDEX IF NOT EXISTS "orders_idempotencyKey_key" ON "orders"("idempotencyKey")'
npx prisma migrate resolve --applied 20260805000000_initial
```

После baseline все дальнейшие изменения применяются только через `npm run prisma:deploy`.

## Вход сотрудников

```text
/staff-login
Почта: ADMIN_EMAIL
Пароль: пароль администратора
```

После входа откроется `/admin`.

## Переменные окружения

```env
DATABASE_URL="postgresql://user:password@pooled-host/database?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://user:password@direct-host/database?sslmode=require"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
AUTH_SECRET="replace-with-a-long-random-secret"
BLOB_READ_WRITE_TOKEN=""
ADMIN_PHONE="+79959178862"
ADMIN_EMAIL="mackacrvena@gmail.com"
SITE_URL="http://localhost:3000"
RESEND_API_KEY=""
EMAIL_FROM="KROOKIES <no-reply@your-domain.ru>"
TELEGRAM_BOT_TOKEN=""
TELEGRAM_WEBHOOK_SECRET=""
DADATA_API_KEY=""
```


### Заполнить `.env.production`

Минимально нужно указать:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SITE_URL`
- `SITE_URL`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Если включены соответствующие функции, дополнительно заполнить:


- `RESEND_API_KEY`
- `EMAIL_FROM`
- `TELEGRAM_*`
- `DADATA_API_KEY`

## Изображения товаров

Изображения хранятся вместе с проектом в `public/images/products` и публикуются Vercel при deployment.
Чтобы добавить новое фото, поместите JPG, PNG или WEBP в эту папку, сделайте commit и push,
а затем укажите в карточке товара путь вида `/images/products/photo.jpg`.
Загрузка файлов через админку отключена, потому что файловая система Vercel не является постоянным хранилищем.
