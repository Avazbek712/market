package com.own.ownproject.service;

import com.own.ownproject.entity.Product;
import com.own.ownproject.payload.ProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {

    Page<ProductDTO> getProducts(Pageable pageable);
}
