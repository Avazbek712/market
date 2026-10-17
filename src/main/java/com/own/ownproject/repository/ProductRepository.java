package com.own.ownproject.repository;

import com.own.ownproject.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Page<Product> findAllBySellerId(Long sellerId, Pageable pageable);

    // Fetch-joins category/seller so ProductMapper's seller.fullName read doesn't
    // trigger a lazy load per distinct seller on the page. Safe to fetch-join here
    // specifically because both are @ManyToOne — unlike @OneToMany (images), a
    // to-one join never multiplies result rows, so pagination stays correct.
    @Override
    @EntityGraph(attributePaths = {"category", "seller"})
    Page<Product> findAll(Specification<Product> spec, Pageable pageable);
}