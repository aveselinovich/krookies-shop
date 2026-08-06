import crypto from "crypto";
import { PrismaClient, ProductBadge, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const adminPhone = process.env.ADMIN_PHONE;
const configuredAdminEmail = process.env.ADMIN_EMAIL;
const adminEmail = configuredAdminEmail
  ?.trim()
  .replace(/^(['"])(.*)\1$/, "$2")
  .trim()
  .toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const products = [
  {
    id: "basic-cookie",
    title: "Базовый минимум",
    slug: "bazovyi-minimum",
    price: 55000,
    weight: "110",
    shortDescription: "Классический мягкий KROOKIE с молочно-шоколадной начинкой и нежным декором.",
    composition: "Пшеничная мука; сливочное масло 82,5%; сахар тростниковый; сахар белый; яйцо куриное; разрыхлитель. Начинка: молочный шоколад; сливки 33%; сливочное масло 82,5%. Декор: молочный шоколад; посыпка. На 100 г готового изделия: 454 ккал, белки — 6.1 г, жиры — 26.3 г, углеводы — 47.9 г.",
    allergens: "Глютен, молоко, яйцо.",
    imageUrl: "/images/products/basic-cookie.jpg",
    badge: null,
    sortOrder: 10,
  },
  {
    id: "patrik-cookie",
    title: "Девочка с Патриков",
    slug: "devochka-s-patrikov",
    price: 55000,
    weight: "110",
    shortDescription: "Матча-cookie с клубничной начинкой, белым шоколадом и сублимированной клубникой.",
    composition: "Пшеничная мука; сливочное масло 82,5%; сахар тростниковый; сахар белый; яйцо куриное; разрыхлитель; порошок матча. Начинка: клубника; сахар; кукурузный крахмал. Декор: белый шоколад; сублимированная клубника. На 100 г готового изделия: 371 ккал, белки — 5.2 г, жиры — 18.2 г, углеводы — 46.4 г.",
    allergens: "Глютен, молоко, яйцо.",
    imageUrl: "/images/products/patrik-cookie.jpg",
    badge: ProductBadge.hit,
    sortOrder: 20,
  },
  {
    id: "caramel-cookie",
    title: "Карамельное облачко",
    slug: "karamelnoe-oblachko",
    price: 55000,
    weight: "100",
    shortDescription: "Нежный KROOKIE с мармеллоу, соленой карамелью и воздушным маршмеллоу-декором.",
    composition: "Пшеничная мука; сливочное масло 82,5%; сахар тростниковый; сахар белый; яйцо куриное; разрыхлитель. Начинка: мармеллоу; солёная карамель. Декор: маршмеллоу. На 100 г готового изделия: 432 ккал, белки — 5.5 г, жиры — 23.2 г, углеводы — 53.7 г.",
    allergens: "Глютен, молоко, яйцо.",
    imageUrl: "/images/products/caramel-cookie.jpg",
    badge: ProductBadge.hit,
    sortOrder: 30,
  },
  {
    id: "tropic-cookie",
    title: "Тропический рай",
    slug: "tropicheskii-rai",
    price: 55000,
    weight: "110",
    shortDescription: "Фисташковый KROOKIE с манговой начинкой, белым шоколадом и дробленой фисташкой.",
    composition: "Пшеничная мука; сливочное масло 82,5%; сахар тростниковый; сахар белый; яйцо куриное; фисташковая паста; дроблённая фисташка; разрыхлитель. Начинка: манго; сахар; кукурузный крахмал. Декор: белый шоколад; дроблёная фисташка. На 100 г готового изделия: 382 ккал, белки — 5.9 г, жиры — 19.2 г, углеводы — 47.0 г.",
    allergens: "Глютен, молоко, яйцо, орехи.",
    imageUrl: "/images/products/tropic-cookie.jpg",
    badge: null,
    sortOrder: 40,
  },
  {
    id: "chocolate-cookie",
    title: "Шоколадный заяц",
    slug: "shokoladnyi-zayats",
    price: 55000,
    weight: "110",
    shortDescription: "Шоколадный KROOKIE с молочно-шоколадной начинкой и дробленым фундуком.",
    composition: "Пшеничная мука; сливочное масло 82,5%; сахар тростниковый; сахар белый; яйцо куриное; какао-порошок; разрыхлитель. Начинка: молочный шоколад; сливки 33%; сливочное масло 82,5%. Декор: молочный шоколад; дроблёные орехи (фундук). На 100 г готового изделия: 449 ккал, белки — 6.5 г, жиры — 27.2 г, углеводы — 47.1 г.",
    allergens: "Глютен, молоко, яйцо, орехи.",
    imageUrl: "/images/products/chocolate-cookie.jpg",
    badge: null,
    sortOrder: 50,
  },
];

async function main() {
  const hasPartialAdminConfig = Boolean(adminPhone || adminEmail || adminPassword) &&
    !(adminPhone && adminEmail && adminPassword);

  if (hasPartialAdminConfig) {
    throw new Error("Set ADMIN_PHONE, ADMIN_EMAIL and ADMIN_PASSWORD together, or leave all three empty");
  }

  if (adminPhone && adminEmail && adminPassword) {
    const existingAdmin = await prisma.user.findUnique({ where: { phone: adminPhone } });
    await prisma.user.upsert({
      where: { phone: adminPhone },
      update: {
        role: UserRole.admin,
        email: adminEmail,
        name: "KROOKIES Admin",
        // A repeat seed must never rotate an administrator's credentials.
        passwordHash: existingAdmin?.passwordHash || hashPassword(adminPassword),
      },
      create: {
        phone: adminPhone,
        email: adminEmail,
        name: "KROOKIES Admin",
        role: UserRole.admin,
        passwordHash: hashPassword(adminPassword),
      },
    });
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      // Products are managed from the admin panel after their first creation.
      // Deploy-time seeding must not overwrite photos, prices, text or sort order.
      update: {},
      create: product,
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
