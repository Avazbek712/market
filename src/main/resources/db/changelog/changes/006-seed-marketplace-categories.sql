--liquibase formatted sql

--changeset avazbek:013-seed-marketplace-categories
--comment: Seed a realistic two-level category tree (top-level + subcategories), modeled on Ozon's taxonomy, for demo/dev data

INSERT INTO categories (name, active, created_at)
VALUES ('Электроника', true, CURRENT_TIMESTAMP),
       ('Одежда и обувь', true, CURRENT_TIMESTAMP),
       ('Дом и сад', true, CURRENT_TIMESTAMP),
       ('Красота и здоровье', true, CURRENT_TIMESTAMP),
       ('Детские товары', true, CURRENT_TIMESTAMP),
       ('Спорт и отдых', true, CURRENT_TIMESTAMP),
       ('Автотовары', true, CURRENT_TIMESTAMP),
       ('Книги и хобби', true, CURRENT_TIMESTAMP),
       ('Зоотовары', true, CURRENT_TIMESTAMP);

INSERT INTO categories (name, parent_id, active, created_at)
SELECT sub.name, parent.id, true, CURRENT_TIMESTAMP
FROM (VALUES ('Смартфоны', 'Электроника'),
             ('Ноутбуки и компьютеры', 'Электроника'),
             ('Телевизоры и аудио', 'Электроника'),
             ('Фото и видео', 'Электроника'),
             ('Аксессуары для электроники', 'Электроника'),

             ('Женская одежда', 'Одежда и обувь'),
             ('Мужская одежда', 'Одежда и обувь'),
             ('Детская одежда', 'Одежда и обувь'),
             ('Обувь', 'Одежда и обувь'),

             ('Мебель', 'Дом и сад'),
             ('Кухня и посуда', 'Дом и сад'),
             ('Текстиль и декор', 'Дом и сад'),
             ('Садовый инвентарь', 'Дом и сад'),

             ('Косметика', 'Красота и здоровье'),
             ('Парфюмерия', 'Красота и здоровье'),
             ('Товары для здоровья', 'Красота и здоровье'),

             ('Игрушки', 'Детские товары'),
             ('Товары для новорождённых', 'Детские товары'),
             ('Школьные принадлежности', 'Детские товары'),

             ('Тренажёры и фитнес', 'Спорт и отдых'),
             ('Велосипеды и самокаты', 'Спорт и отдых'),
             ('Туризм и кемпинг', 'Спорт и отдых'),

             ('Запчасти', 'Автотовары'),
             ('Автоэлектроника', 'Автотовары'),
             ('Аксессуары для авто', 'Автотовары'),

             ('Художественная литература', 'Книги и хобби'),
             ('Детские книги', 'Книги и хобби'),
             ('Канцелярия', 'Книги и хобби'),

             ('Корм для животных', 'Зоотовары'),
             ('Аксессуары для животных', 'Зоотовары')
     ) AS sub (name, parent_name)
         -- Must also filter by active=true: on an environment with pre-existing
         -- (even soft-deleted) categories sharing a name with one of ours, the
         -- join would match every same-named row and insert each subcategory
         -- once per match, immediately tripping the unique index. Caught on
         -- production, which had old test categories including an "Электроника".
         JOIN categories parent ON parent.name = sub.parent_name AND parent.parent_id IS NULL AND parent.active = true;

--rollback DELETE FROM categories WHERE parent_id IS NOT NULL;
--rollback DELETE FROM categories WHERE name IN ('Электроника', 'Одежда и обувь', 'Дом и сад', 'Красота и здоровье', 'Детские товары', 'Спорт и отдых', 'Автотовары', 'Книги и хобби', 'Зоотовары');
