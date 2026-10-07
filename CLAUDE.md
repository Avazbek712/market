# MiniMarket — контекст проекта для Claude Code

Этот файл читается автоматически в начале каждой сессии Claude Code в этом репозитории, на любом устройстве. Собран из двух источников: технический снимок стека/структуры (от одной сессии) + раздел про стиль совместной работы и историю (от другой), сведены воедино и сверены с реальным кодом на 06.10.2026.

**Перед тем как что-либо менять — сверь ключевые факты (структуру пакетов, SecurityConfig, entity-поля) с реальными файлами в репозитории.** Уже был случай, когда пересказ разошёлся с действительностью — не доверяй этому файлу слепо, особенно если с момента последней правки прошло много времени или сессий.

## О проекте

Учебный pet-проект и одновременно портфолио-пример: мультивендорный маркетплейс (MiniMarket), modular monolith на Spring Boot. Автор — junior Java backend-разработчик, пишет код сам, изучает Spring Boot/Security/JPA/Docker/Kafka на практике. Цель — не просто "работающий код", а прод-грейд реализация: реальный деплой на VPS, CI/CD, без хардкода секретов. Репозиторий на GitHub **публичный** (осознанный выбор для портфолио) — именно поэтому реальный IP VPS и все секреты никогда не коммитятся, только `${VAR}`-плейсхолдеры в `.env.example`; реальные значения — в GitHub Actions secrets или в `.env` на сервере. Если понадобится IP/креды сервера — спроси у пользователя напрямую, не гадай.

## Кто пользователь и как с ним работать

**Backend — по умолчанию review-cycle, а не "напиши за меня":**
- Пользователь обычно пишет код сам, по шагам, которые ему подробно объясняют (что писать, зачем, какие есть варианты и почему выбран тот или иной). Цель учебная — объясняй решения, а не просто выдавай готовый код.
- После того как он что-то написал — перепроверяю (читаю файл, компилирую, по возможности гоняю живые тесты через curl/докер) и честно называю баги, а не хвалю всё подряд.
- **Никогда не переписывать работающий код молча** — объяснить и дождаться подтверждения, особенно если это касается Auth-модуля. При архитектурной неоднозначности — сначала спросить, не домысливать.
- Исключение: если пользователь явно просит "напиши сам", "допиши", "сделай полностью" — тогда пишу код напрямую, но всё равно объясняю, что и почему, и по возможности проверяю вживую (не только компиляцией).
- Миграции Liquibase — можно писать самому Claude (устоявшийся паттерн), но **никогда не редактировать уже применённый changeset** — сначала проверить `databasechangelog` в базе (или `Previously run: N` в логах Liquibase при старте); если уже выполнялся хоть где-то — добавлять новый changeset, не трогать старый.

**Frontend — Claude владеет реализацией напрямую:**
- В отличие от backend, здесь не строгий review-cycle — пользователь даёт промпт/дизайн-задачу, Claude пишет код сам.
- Стиль уже устоялся: см. `CategoryManager.tsx`/`ProductManager.tsx` как образец компонента, `api/*.ts` как образец API-слоя, `CatalogPage`/`ProductCard`/`ProductGrid` как образец публичных страниц с `framer-motion`. Новые фичи должны соответствовать этому стилю.

**Git и сервер — не трогать без явной просьбы:**
- Пользователь коммитит и пушит сам. Не делать `git commit`/`git push` самостоятельно без явной просьбы — но если прямо просят (например, смержить из main) — делать аккуратно: сверить расхождение (`git log A..B`), не затирать незакоммиченное молча (если есть конфликт с untracked-файлом — сначала показать пользователю, не перезаписывать).
- То же для прод-сервера: диагностика (SSH, `docker inspect`, логи, `psql` read-only) — свободно; любое изменение состояния (`docker compose up -d`, правки `.env` на сервере, перезапуск контейнеров) — только после явного согласия.

**Стиль работы — маленькими шагами, с проверкой:**
- Планы обычно разбиваются на пронумерованные шаги; пользователь делает один шаг, потом просит следующий.
- Перед тем как считать что-то готовым — компилировать (`./mvnw compile`, `npx tsc -b`), а по возможности поднимать реальное окружение и гонять через `curl`/браузер, а не верить на слово, что "должно работать".

## Стек

- Java 17, Spring Boot 4.1.0 (Spring Framework 7)
- PostgreSQL (Docker, порт 5433→5432 локально), Spring Data JPA / Hibernate (`ddl-auto=validate` — схему создаёт ТОЛЬКО Liquibase, не Hibernate)
- Liquibase (НЕ Flyway), formatted SQL changelogs: `src/main/resources/db/changelog/db.changelog-master.yaml` + `changes/*.sql`
- Redis, Apache Kafka (`apache/kafka:4.3.1`, KRaft) — заявлены в стеке/инфре, но кода под них пока нет
- MinIO (объектное хранилище файлов/изображений товаров)
- Spring Security + JJWT 0.13.0 — permission-based авторизация
- MapStruct 1.6.3 + lombok-mapstruct-binding 0.2.0 (порядок annotation processor'ов в maven-compiler-plugin: mapstruct-processor, lombok, lombok-mapstruct-binding)
- Lombok — НЕ используется `@Data` на JPA-сущностях (риск equals/hashCode по коллекциям в `@ManyToMany`), только `@Getter`/`@Setter` вручную
- Frontend (`frontend/`, отдельная папка рядом с Maven-модулем): React 19 + TypeScript + Vite, Tailwind 4 (через `@tailwindcss/vite`), react-router-dom 7, react-i18next (локали `en`/`ru`), axios, framer-motion

## Структура пакета com.own.ownproject

```
config/auth/jwt/  SecurityConfig, CustomUserDetails, CustomUserDetailsService,
                  JwtService, JwtAuthFilter
config/file/      MinioConfig
controller/       AuthController, CategoryController, FileController,
                  ProductController, UserController
entity/           AbsEntity (@MappedSuperclass), User, Role, Permission,
                  Category, Product, ProductImage, FileAsset
exception/        CategoryNotFoundException, EmailAlreadyExistsException,
                  FileStorageException, InvalidRoleException,
                  ProductNotFoundException, UserNotFoundException
handler/          GlobalExceptionHandler (@RestControllerAdvice)
impl/             CategoryServiceImpl, FileStorageServiceImpl,
                  ProductServiceImpl, UserServiceImpl
mapper/           CategoryMapper, ProductMapper, UserMapper (MapStruct)
payload/          CategoryDTO, CreateCategoryDTO, CreateProductDTO, ErrorDTO,
                  FieldErrorDTO, LoginDTO, ProductDTO, RegisterDTO, TokenDTO,
                  UserMeDTO
repository/       CategoryRepository, FileAssetRepository, ProductRepository,
                  RoleRepository, UserRepository
service/          CategoryService, FileStorageService, ProductService,
                  UserService
```
Плюс `src/main/java/enums/FileCategory.java` — вне пакета `com.own.ownproject` (известное отклонение, не баг, но стоит иметь в виду при поиске файла).

## Модель данных — что реально существует

- **User**: id, email (unique), passwordHash, fullName, role (`@ManyToOne`→Role)
- **Role**: id, name, description, permissions (`@ManyToMany`→Permission, через `role_permissions`)
- **Permission**: id, code (unique), description
- **Category**: id, name (unique), description, parent (`@ManyToOne`→Category, self-reference — вложенность до 2 уровней, осознанное расширение сверх исходного плоского ТЗ)
- **Product**: id, name, description, price (BigDecimal), quantity, category (`@ManyToOne`), seller (`@ManyToOne`→User), images (`@OneToMany`→ProductImage, с `sortOrder` — галерея, не одна картинка). Остатки (`quantity`) — прямое поле на Product, отдельной сущности Inventory с optimistic locking нет (осознанно).
- **ProductImage**: id, product (`@ManyToOne`), fileAsset (`@ManyToOne`→FileAsset), sortOrder
- **FileAsset**: id, storageKey (unique), originalFileName, contentType, uploadedBy (`@ManyToOne`→User), sizeBytes, category (enum FileCategory — задел на переиспользование не только для товаров, например для будущих аватаров)

**Чего НЕ существует вообще, ни в каком виде:** Cart/CartItem, Order/OrderItem, Review, SellerProfile, NotificationLog, Inventory (отдельной сущности). Также: нет тестов (JUnit-зависимости в `pom.xml` есть, тестов — нет), CORS нигде не настроен. Не добавляй UI или бизнес-логику под несуществующее без явного запроса.

## Permission-based security (RBAC поверх БД, не hardcoded enum)

- User → Role: `@ManyToOne` (одна роль на юзера).
- Role ↔ Permission: `@ManyToMany`, права роли меняются через БД без изменения кода.
- Авторизация ИСКЛЮЧИТЕЛЬНО через `@PreAuthorize("hasAuthority('КОД')")`. `hasRole()` нигде не используется и не должен использоваться.
- JWT claims: subject = email, claim с правами — снимок на момент логина (не live-проверка). Роль в токене НЕ хранится — единственный источник роли для фронтенда — `GET /api/user/me`.
- Известные коды permission: `ROLE_VIEW`, `PERMISSION_VIEW`, `ROLE_MANAGE` (все три — только у ADMIN), `CATEGORY_MANAGE` (ADMIN), `PRODUCT_CREATE`/`PRODUCT_MANAGE` (SELLER и ADMIN).
- `PRODUCT_MANAGE` сам по себе не разделяет "свой/чужой" товар — проверка владения (владелец или ADMIN) сделана вручную внутри `ProductServiceImpl.assertOwnerOrAdmin`, а не через permission-систему.

## Locked бизнес-правила (не менять без явного запроса)

- `POST /api/auth/register` — один эндпоинт на всех. Роль — строка в теле, разрешены строго `"BUYER"`/`"SELLER"` (двойная защита: валидация на DTO + explicit whitelist в сервисе — не дублирование по ошибке, а defense in depth против privilege escalation).
- ADMIN никогда не регистрируется публично. Механизм создания первого админа — вручную через `UPDATE users SET role_id=...` в БД (уже делали так на проде).
- Логин идентичен для всех ролей, роль не влияет на сам механизм входа.
- Email — уникален через ЧАСТИЧНЫЙ индекс (`WHERE active=true`), не обычный column UNIQUE — переиспользуем email после soft-delete аккаунта. Тот же паттерн у имени категории.
- `LoginDTO` называет поле `username`, хотя по факту это email — исторический артефакт, зафиксирован, фронтенд (`api/auth.ts`) под это уже подстроен. Не переименовывать в одностороннем порядке.

## Актуальные REST-пути

- `POST /api/auth/register`, `POST /api/auth/login` — permitAll
- `GET /api/user/me` — authenticated
- `GET /api/categories` — permitAll; `POST`/`PATCH {id}`/`DELETE {id}` — `CATEGORY_MANAGE`
- `GET /api/products` — permitAll, с query-параметрами `categoryId`, `search`, `minPrice`, `maxPrice` + `Pageable` (`page`/`size`/`sort`), реализовано через `Specification`/`JpaSpecificationExecutor<Product>`
- `GET /api/products/{id}` — permitAll, 404 → `PRODUCT_NOT_FOUND`
- `GET /api/products/mine` — защищено `@PreAuthorize("isAuthenticated()")` на самом методе контроллера (не URL-матчером в `SecurityConfig` — там этот путь формально подпадает под общий `permitAll` на `GET /api/products/**`, но метод-левел security всё равно требует реального логина)
- `POST /api/products` (multipart, с фото) — `PRODUCT_CREATE`; `PATCH {id}`/`DELETE {id}` — `PRODUCT_MANAGE` + проверка владения (см. выше)
- `GET /api/files/{id}` — permitAll, отдаёт сырые байты файла с правильным Content-Type напрямую как `<img src>` — MinIO при этом остаётся полностью закрытым от внешнего мира, бэкенд единственная точка доступа

CORS не настроен — фронт работает через относительный `baseURL: '/api'` в axios, в dev-режиме рассчитан на Vite-прокси `/api → localhost:8080` (см. `frontend/vite.config.ts`), в проде — через тот же домен за nginx.

## Frontend — структура

```
src/
├── api/        client.ts (axios, baseURL '/api', interceptor на токен
│               + сброс при 401/403-без-тела), auth.ts, categories.ts,
│               products.ts, user.ts, errors.ts
├── auth/       AuthContext.tsx, ProtectedRoute.tsx (allow=[роли]),
│               HomeRedirect.tsx, roles.ts, authEvents.ts
├── components/ ActionIcons, AuthCard, CategoryManager, DashboardLayout,
│               DecorativeIcons, FieldIcons, FiltersBar, FormField,
│               LanguageSwitcher, ProductCard, ProductGrid, ProductManager,
│               PublicLayout, Spinner, SubmitButton
├── locales/    en.json, ru.json (держать синхронными — одинаковое число ключей)
└── pages/      LoginPage, RegisterPage, CatalogPage, ProductDetailPage,
                BuyerDashboard, SellerDashboard, AdminDashboard
```
Роутинг (`App.tsx`): `/login`, `/register`, `/products/:id` (публичная деталка товара), `/` → `HomeRedirect` (гости и BUYER видят публичный каталог `CatalogPage`, SELLER/ADMIN сразу редиректятся в свой дашборд), `/buyer` `/seller` `/admin` — защищённые по роли через `ProtectedRoute`. Токен — в `localStorage`.

## Пройденные этапы (хронологически)

1. **Auth-модуль** — JWT, роли/права, `/api/auth/{login,register}`, `/api/user/me`
2. **Category-модуль** — вложенные категории, soft-delete, admin UI (`CategoryManager.tsx`)
3. **VPS-деплой** — Contabo VPS, Ubuntu, SSH только по ключу без root, ufw, Docker Compose (postgres/redis/kafka/minio/backend/nginx, наружу смотрит только nginx:80), GitHub Actions CI/CD (`build` → `docker` → `deploy`). TLS/домен — сознательно отложено.
4. **File/MinIO-модуль** — `FileAsset`, `FileStorageService` (upload/download/delete), `FileCategory` enum
5. **Product-модуль (CRUD)** — `Product`/`ProductImage` (галерея, не одна картинка), права `PRODUCT_CREATE`/`PRODUCT_MANAGE`, проверка владения при update/delete
6. **Публичный каталог** — фильтры (категория/поиск/цена/сортировка) через `Specification`, `GET /products/{id}`, `CatalogPage`/`ProductDetailPage`/`FiltersBar`/`ProductCard`/`ProductGrid` на `/`, `framer-motion`
7. **Фикс лимитов загрузки фото** — nginx `client_max_body_size` + Spring multipart были 1MB, резали обычные фото с телефона; подняты до 10MB/файл, 50MB/запрос синхронно в nginx и Spring, добавлен `FILE_TOO_LARGE`, фронт отдельно обрабатывает голый 413 от nginx (до бэкенда не долетает, JSON-тела нет)

## Архитектурные соглашения (держать консистентными)

- **Soft-delete везде**: `@SQLDelete` + `@SQLRestriction(active=true)` на entity. Для полей с уникальностью, которые нужно переиспользовать после "удаления" (email, имя категории) — partial unique index (`WHERE active = true`), а не обычный `UNIQUE`.
- **DTO разделены на чтение и запись** — `ProductDTO`/`CreateProductDTO`, `CategoryDTO`/`CreateCategoryDTO`.
- **MapStruct-мапперы** — `@Mapping(source = "x.id", target = "xId")` для вложенных связей; для сложных случаев (например, список id картинок из списка `ProductImage`) — `default`-метод прямо в интерфейсе маппера.
- **Кастомные исключения** — `RuntimeException` + поле `HttpStatus`, обработчик в `GlobalExceptionHandler` с `log.warn(...)` (ожидаемые доменные ошибки) или `log.error(...)` (реально неожиданные). Код ответа клиенту — обобщённый, без внутренних деталей/стектрейса наружу.
- **`@Transactional(readOnly = true)`** на любом сервис-методе, который возвращает entity с ленивыми связями, которые потом читает маппер — проект держит `spring.jpa.open-in-view=false` осознанно, поэтому без транзакции ленивые **коллекции** (`@OneToMany`) упадут с `LazyInitializationException` (ленивые **скаляры** типа `@ManyToOne`, если читается только `.getId()`, не упадут — у Hibernate-прокси есть шорткат, но не для коллекций и не для других полей).
- **`@JoinColumn(name = ...)` всегда явно указывать**, если имя колонки в БД не совпадает с дефолтным Hibernate-неймингом (`поле + "_id"`) — расхождение однажды уронило прод (см. ниже).

## Реальные баги, которые уже ловили (чтобы не наступить второй раз)

- **`FileAsset.uploadedBy` без `@JoinColumn`** ожидался Hibernate как колонка `uploaded_by_id`, а в миграции колонка называлась `uploaded_by` — уронило прод в crash-loop сразу после деплоя. Чинится явным `@JoinColumn(name = "uploaded_by")` на стороне Java, миграцию трогать было нельзя (уже применена).
- **Дыра в авторизации**: `PRODUCT_MANAGE` выдаётся всем SELLER, без явной проверки любой продавец мог редактировать/удалять чужие товары. Исправлено — `assertOwnerOrAdmin`.
- **Гонка при деплое**: `docker compose pull` в CI иногда не успевал получить только что запушенный в GHCR образ (registry propagation lag), контейнер пересоздавался на старом образе. Если на сервере образ явно старее последнего мержа — первое, что стоит заподозрить (уже чинилось).
- **`io.minio:minio:9.0.3`** — битый релиз, тянет пустой артефакт `okhttp:5.3.2` (767 байт вместо нормального jar). Зафиксирована рабочая версия `8.5.17`.
- **nginx/Spring multipart-лимиты по умолчанию — 1MB** — резали обычные фото с телефона ещё до того, как запрос доходил до логики загрузки. Если где-то ещё появится загрузка файлов — не забыть про `client_max_body_size` в nginx синхронно с `spring.servlet.multipart.max-*`.

## Открытые/приостановленные темы

- **Бэкапы БД** — начинали настраивать выгрузку `pg_dump` в MinIO с retention в неделю через lifecycle-правило бакета, остановились на том, что `minio/mc` не тянулся с Docker Hub — нужно поискать альтернативный путь.
- **TLS/домен** — сознательно отложено, домена ещё нет.
- Admin-модерация чужих товаров (не через `/products/mine`) на фронте не сделана — только своя витрина продавца.
- Дальше двигаемся по шагам, которые пользователь выбирает сам в начале каждой сессии — не предполагать заранее, что "следующий шаг" — это то-то, спросить.
