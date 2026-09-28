package com.own.ownproject.service;

import com.own.ownproject.payload.CreateProductDTO;
import com.own.ownproject.payload.ProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {

    Page<ProductDTO> getProducts(Pageable pageable);

    Page<ProductDTO> getMyProducts(Pageable pageable, Authentication authentication);

    ProductDTO createProduct(CreateProductDTO createProductDTO, List<MultipartFile> images, Authentication authentication);

    ProductDTO updateProduct(Long id, CreateProductDTO createProductDTO, Authentication authentication);

    void deleteProduct(Long id, Authentication authentication);

    ProductDTO getProductById(Long id, Authentication authentication);
}
