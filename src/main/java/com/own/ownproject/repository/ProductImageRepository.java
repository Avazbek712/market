package com.own.ownproject.repository;

import com.own.ownproject.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
}
