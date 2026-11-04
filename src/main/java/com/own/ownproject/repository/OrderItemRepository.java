package com.own.ownproject.repository;

import com.own.ownproject.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // oi.product.id is a path to the FK column, not the Product association itself,
    // so Hibernate resolves it without joining to products — safe even for products
    // that were later soft-deleted.
    @Query("select oi.product.id as productId, count(oi) as count from OrderItem oi where oi.product.id in :productIds group by oi.product.id")
    List<ProductCountProjection> countByProductIdIn(@Param("productIds") List<Long> productIds);
}
