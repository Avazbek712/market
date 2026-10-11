--liquibase formatted sql

--changeset avazbek:012-add-product-constraints
--comment: Defense-in-depth — enforce price > 0 and quantity >= 0 at the DB level, matching CreateProductDTO validation

ALTER TABLE product
    ADD CONSTRAINT chk_product_price_positive CHECK (price > 0);

ALTER TABLE product
    ADD CONSTRAINT chk_product_quantity_non_negative CHECK (quantity >= 0);

--rollback ALTER TABLE product DROP CONSTRAINT chk_product_price_positive;
--rollback ALTER TABLE product DROP CONSTRAINT chk_product_quantity_non_negative;
