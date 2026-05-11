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
npx prisma migrate dev --name init
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

## Вход сотрудников

```text
/staff-login
Почта: ADMIN_EMAIL
Пароль: пароль администратора
```

После входа откроется `/admin`.

## Переменные окружения

```env
DATABASE_URL="postgresql://postgres.project-ref:password@aws-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
AUTH_SECRET="replace-with-a-long-random-secret"
ADMIN_PHONE="+79959178862"
ADMIN_EMAIL="mackacrvena@gmail.com"
SITE_URL="http://localhost:3000"
SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET="product-images"
YOOKASSA_SHOP_ID=""
YOOKASSA_SECRET_KEY=""
YOOKASSA_WEBHOOK_SECRET=""
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
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

Если включены соответствующие функции, дополнительно заполнить:


- `RESEND_API_KEY`
- `EMAIL_FROM`
- `TELEGRAM_*`
- `DADATA_API_KEY`

