package com.own.ownproject.repository;

import com.own.ownproject.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByUserIdAndProductId(Long userId, Long productId);

    Page<Favorite> findAllByUserId(Long userId, Pageable pageable);

    // f.product.id is a path to the FK column, not the Product association itself,
    // so Hibernate resolves it without joining to products — safe even for products
    // that were later soft-deleted.
    @Query("select f.product.id as productId, count(f) as count from Favorite f where f.product.id in :productIds group by f.product.id")
    List<ProductCountProjection> countByProductIdIn(@Param("productIds") List<Long> productIds);
}
