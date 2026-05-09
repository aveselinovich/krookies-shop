# KROOKIES Shop Full MVP

Полная MVP-версия интернет-магазина KROOKIES: витрина, корзина, checkout-заявка, Prisma/PostgreSQL, админка, личный кабинет, вход по телефону и заготовка интеграции ЮKassa.

## Что внутри

- Главная, каталог, карточки товаров, корзина, checkout
- Создание заказа-заявки: клиент не платит сразу
- Админка `/admin`: статистика, заказы, детальная карточка заказа, управление товарами
- Личный кабинет `/account`: список и детали заказов клиента
- Авторизация по телефону + коду
- Dev-код входа: `1111`
- Админ определяется по номеру `+79959178862`
- ЮKassa: создание payment link менеджером и webhook оплаты
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

## Вход в админку

```text
/login
Телефон: +79959178862
Код: 1111
```

После входа откроется `/admin`.

## Проверка основного сценария

1. Открыть `/catalog`
2. Добавить печенье в корзину
3. Перейти `/cart`
4. Открыть `/checkout`
5. Заполнить форму и отправить заказ
6. Войти админом в `/login`
7. Открыть `/admin/orders`
8. Открыть заказ
9. Сформировать ссылку на оплату ЮKassa
10. После оплаты webhook должен перевести заказ в `accepted`

## Переменные окружения

```env
DATABASE_URL="postgresql://postgres.project-ref:password@aws-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
AUTH_SECRET="replace-with-a-long-random-secret"
ADMIN_PHONE="+79959178862"
ADMIN_EMAIL="mackacrvena@gmail.com"
SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET="product-images"
YOOKASSA_SHOP_ID=""
YOOKASSA_SECRET_KEY=""
YOOKASSA_WEBHOOK_SECRET=""
DIRECT_VERIFIER_API_KEY=""
DIRECT_VERIFIER_GATEWAY_ID=""
OTP_MOCK_CODE=""
TELEGRAM_BOT_TOKEN=""
TELEGRAM_WEBHOOK_SECRET=""
```

## Важно перед production

- Создать в Supabase публичный bucket `product-images` или указать своё имя в `SUPABASE_STORAGE_BUCKET`
- Добавить в env `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY`
- Для Vercel + Prisma + Supabase использовать `DATABASE_URL` в transaction mode `:6543` с `?pgbouncer=true&connection_limit=1`
- Для Prisma CLI (`db push`, `seed`) использовать `DIRECT_URL` на direct connection `db....supabase.co:5432`
- Подключить реальные ключи ЮKassa
- Добавить в env `DIRECT_VERIFIER_API_KEY` и `DIRECT_VERIFIER_GATEWAY_ID`
- Для тестовой авторизации без реальной SMS можно временно указать `OTP_MOCK_CODE="1111"`
- Добавить в env `TELEGRAM_BOT_TOKEN` и `TELEGRAM_WEBHOOK_SECRET`
- Указать webhook в кабинете ЮKassa: `https://ваш-домен.ru/api/payment/webhook`
- Указать webhook для Telegram бота: `https://ваш-домен.ru/api/telegram/webhook`
- Усилить webhook проверкой платежа через `GET /v3/payments/{payment_id}`
- Для production убедиться, что SMS настроен, иначе отправка кода входа будет возвращать ошибку
- Заменить `AUTH_SECRET` на длинную случайную строку
- Убрать dev-подсказку с кодом из интерфейса входа
- Загрузить реальные фото товаров
- Провести мобильную и дизайн-полировку

## Direct SMS

Для отправки кодов входа проект использует Direct API:

- метод: `POST https://direct.i-dgtl.ru/api/v1/message`
- авторизация: `Authorization: Basic {TOKEN_1}`
- для Direct verifier нужен отдельный ключ типа `TOKEN_3` и `gatewayId` модуля верификации

По документации:
- нужен API-ключ типа `{TOKEN_1}` для работы с сообщениями
- ключ создаётся в личном кабинете `Разработчикам → API`
- API нельзя вызывать из браузера, только с сервера

Официальная документация:
- [Авторизация запросов](https://api.docs.direct.i-dgtl.ru/authorization)
- [Отправка SMS](https://api.docs.direct.i-dgtl.ru/messages/sms-sending)
