# MiniMarket — контекст проекта для Claude Code

Этот файл — сводка состояния проекта на 29.09.2026, собранная в разговоре
с ментором (Claude в chat), не автоматически синхронизируется с кодом.
**Перед тем как что-либо менять — сверь ключевые факты (структуру пакетов,
SecurityConfig, entity-поля) с реальными файлами в репозитории.** Ниже уже
был случай, когда пересказ разошёлся с действительностью — не доверяй
этому файлу слепо, особенно разделу "В работе, статус не подтверждён".

## О проекте

Учебный pet-проект: мультивендорный маркетплейс (MiniMarket) —
modular monolith на Spring Boot. Автор — junior Java backend разработчик,
пишет код сам, изучает Spring Boot/Security/JPA/Docker/Kafka на практике.

**Стиль работы с автором:** объясняй предлагаемые решения и почему именно
так, а не просто "что" — цель проекта учебная. Не рефактори и не переписывай
существующий рабочий код молча по своей инициативе — только по явному
запросу. При архитектурной неоднозначности — сначала спроси, не домысливай.

## Стек

- Java 17, Spring Boot 4.1.0 (Spring Framework 7)
- PostgreSQL (Docker, порт 5433→5432, db/user/pass=minimarket),
  Spring Data JPA / Hibernate (`ddl-auto=validate` — схему создаёт
  ТОЛЬКО Liquibase, не Hibernate)
- Liquibase (НЕ Flyway), formatted SQL changelogs:
  `src/main/resources/db/changelog/db.changelog-master.yaml` + `changes/*.sql`
- Redis, Apache Kafka (`apache/kafka:4.3.1`, KRaft — заявлены в стеке,
  но кода под них пока нет, см. "Чего не существует")
- MinIO (объектное хранилище файлов/изображений товаров)
- Spring Security + JJWT 0.13.0 — permission-based авторизация
- MapStruct 1.6.3 + lombok-mapstruct-binding 0.2.0 (порядок annotation
  processor'ов в maven-compiler-plugin: mapstruct-processor, lombok,
  lombok-mapstruct-binding)
- Lombok — НЕ используется `@Data` на JPA-сущностях (риск equals/hashCode
  по коллекциям в `@ManyToMany`), только `@Getter`/`@Setter` вручную
- Frontend (`frontend/`, отдельная папка рядом с Maven-модулем):
  React 19 + TypeScript + Vite, Tailwind 4 (через `@tailwindcss/vite`),
  react-router-dom 7, react-i18next (локали `en`/`ru`), axios

## Структура пакета com.own.ownproject (на момент последней проверки)

```
config/auth/jwt/  SecurityConfig, CustomUserDetails, CustomUserDetailsService,
                  JwtService, JwtAuthFilter
config/file/      MinioConfig
controller/       AuthController, CategoryController, FileController,
                  ProductController, UserController
entity/           AbsEntity (@MappedSuperclass), User, Role, Permission,
                  Category, Product, ProductImage, FileAsset
exception/        EmailAlreadyExistsException, InvalidRoleException,
                  UserNotFoundException, CategoryNotFoundException,
                  ProductNotFoundException, FileStorageException
handler/          GlobalExceptionHandler (@RestControllerAdvice)
impl/             UserServiceImpl, CategoryServiceImpl, ProductServiceImpl,
                  FileStorageServiceImpl
mapper/           UserMapper, CategoryMapper, ProductMapper (MapStruct)
payload/          LoginDTO, RegisterDTO, TokenDTO, UserMeDTO, CategoryDTO,
                  CreateCategoryDTO, ProductDTO, CreateProductDTO, ErrorDTO,
                  FieldErrorDTO
repository/       UserRepository, RoleRepository, CategoryRepository,
                  ProductRepository, FileAssetRepository
```
Плюс `src/main/java/enums/FileCategory.java` — вне пакета `com.own.ownproject`.

## Модель данных — что реально существует

- **User**: id, email (unique), passwordHash, fullName, role (`@ManyToOne`→Role)
- **Role**: id, name, description, permissions (`@ManyToMany`→Permission,
  через `role_permission`)
- **Permission**: id, code (unique), description
- **Category**: id, name (unique), description, **parent (`@ManyToOne`→Category,
  self-reference — иерархия)**. Отклонение от исходного ТЗ (там был плоский
  список без вложенности для Фазы 1) — осознанное расширение, учитывай при
  работе с категориями (это не баг).
- **Product**: id, name, description, price (BigDecimal), quantity,
  category (`@ManyToOne`), seller (`@ManyToOne`→User),
  images (`@OneToMany`→ProductImage). Остатки (`quantity`) — прямое поле
  на Product, отдельной сущности Inventory с optimistic locking НЕТ
  (тоже отклонение от исходного ТЗ, тоже осознанно).
- **ProductImage**: id, product (`@ManyToOne`), fileAsset (`@ManyToOne`→FileAsset),
  sortOrder
- **FileAsset**: id, storageKey (unique), originalFileName, contentType,
  uploadedBy (`@ManyToOne`→User), sizeBytes, category (enum FileCategory)

**Чего НЕ существует вообще, ни в каком виде:** Cart/CartItem, Order/OrderItem,
Review, SellerProfile, NotificationLog. Не добавляй UI или бизнес-логику под
это без явного запроса — выдуманный функционал без бэкенда работать не будет.

## Permission-based security (RBAC поверх БД, не hardcoded enum)

- User → Role: `@ManyToOne` (одна роль на юзера).
- Role ↔ Permission: `@ManyToMany`, права роли меняются через БД без
  изменения кода.
- Авторизация ИСКЛЮЧИТЕЛЬНО через `@PreAuthorize("hasAuthority('КОД')")`.
  `hasRole()` нигде не используется и не должен использоваться.
- JWT claims: subject = email, claim `perms` = список кодов permission
  на момент логина (снимок, не live-проверка). Роль в токене НЕ хранится —
  единственный источник роли для фронтенда — `GET /api/user/me`.
- Известные коды permission: `ROLE_VIEW`, `PERMISSION_VIEW`, `ROLE_MANAGE`
  (все три — только у ADMIN), `CATEGORY_MANAGE`, `PRODUCT_CREATE`,
  `PRODUCT_MANAGE`.

## Locked бизнес-правила (не менять без явного запроса)

- `POST /api/auth/register` — один эндпоинт на всех. Роль — строка в теле,
  разрешены строго `"BUYER"`/`"SELLER"` (проверка в два слоя: `@Pattern` на
  DTO + explicit whitelist в сервисе — defense in depth, не дублирование
  по ошибке).
- ADMIN никогда не регистрируется публично. Роль засеяна в БД, юзера с этой
  ролью пока не существует — механизм создания первого админа не выбран.
- Логин идентичен для всех ролей, роль не влияет на сам механизм входа.
- Email — уникален через ЧАСТИЧНЫЙ индекс (`WHERE active=true`), не обычный
  column UNIQUE — переиспользуем email после soft-delete аккаунта.
- `RoleController` (admin API управления permissions роли, под `ROLE_MANAGE`)
  заявлен в ТЗ, в коде отсутствует.

## Актуальные REST-пути (на момент последней проверки)

- `POST /api/auth/register`, `POST /api/auth/login` — permitAll
- `GET /api/user/me` — authenticated
- `GET /api/categories` — permitAll; `POST`/`PATCH {id}`/`DELETE {id}` —
  `CATEGORY_MANAGE`
- `GET /api/products` — permitAll, сейчас **только пагинация**, без
  фильтров/поиска/сортировки (это могло измениться — см. секцию ниже);
  `GET /api/products/mine` — authenticated; `POST` (multipart) —
  `PRODUCT_CREATE`; `PATCH {id}`/`DELETE {id}` — `PRODUCT_MANAGE`
- `GET /api/files/{id}` — permitAll, отдаёт сырые байты файла с
  правильным Content-Type, используется напрямую как `<img src>`

**Важно:** `LoginDTO` называет поле `username`, хотя по факту это email —
исторический артефакт, зафиксирован, фронтенд (`api/auth.ts`) под это уже
подстроен. Не переименовывай в одностороннем порядке.

CORS не настроен (на момент последней проверки) — фронт работает через
относительный `baseURL: '/api'` в axios, значит рассчитан на Vite dev-proxy
`/api → localhost:8080`. Проверь `frontend/vite.config.ts` — если проксирования
нет, запросы с фронта физически не достучатся до бэкенда в dev-режиме.

## В работе, статус НЕ подтверждён — проверь реальное состояние кода

Последним был отправлен большой промт на выполнение (автор ответил "делай
всё"), включающий:
1. **Backend**: добавить в `GET /api/products` query-параметры
   `categoryId`, `search`, `minPrice`, `maxPrice` + поддержку `?sort=...`
   через `Pageable`, реализовать через `JpaSpecificationExecutor<Product>`.
2. **Frontend**: публичная страница каталога на `/` (доступна без логина —
   бэкенд это уже разрешает), детальная страница товара на `/products/:id`
   (требует существующий `GET /api/products/{id}` — на момент составления
   промта было неясно, реализован ли он уже; если ProductDTO там облегчённый
   — не хватает полей для полной карточки, нужно уточнять у автора, не
   дописывать самостоятельно), фильтры/поиск/сортировка в UI, skeleton-
   загрузка, framer-motion анимации (появление карточек, ховер, переходы).

**Прежде чем продолжать эту задачу или считать её частью сделанного —
проверь фактическое состояние кода** (есть ли уже `/products/:id` роут,
установлен ли `framer-motion`, добавлены ли query-параметры в
`ProductController`) — не полагайся на то, что раз промт был отправлен,
значит выполнено полностью и корректно.

## Frontend — структура (на момент последней проверки)

```
src/
├── api/        client.ts (axios, baseURL '/api', interceptor на токен
│               + сброс при 401/403-без-тела), auth.ts, categories.ts,
│               products.ts, user.ts, errors.ts
├── auth/       AuthContext.tsx, ProtectedRoute.tsx (allow=[роли]),
│               HomeRedirect.tsx, roles.ts, authEvents.ts
├── components/ ActionIcons, AuthCard, CategoryManager, DashboardLayout,
│               DecorativeIcons, FieldIcons, FormField, LanguageSwitcher,
│               ProductManager, Spinner, SubmitButton
├── locales/    en.json, ru.json
└── pages/      LoginPage, RegisterPage, BuyerDashboard, SellerDashboard,
                AdminDashboard
```
Роутинг (`App.tsx`): `/login`, `/register`, `/` → `HomeRedirect`,
`/buyer` `/seller` `/admin` — защищённые по роли через `ProtectedRoute`.
Токен — в `localStorage` (интерцептор в `client.ts`).

**На момент последней полной проверки страницы публичного каталога
(доступной без логина) не существовало** — это и была основная задача
"В работе" выше, проверь, появилась ли она.
