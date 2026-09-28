package com.own.ownproject.controller;

import com.own.ownproject.payload.CreateProductDTO;
import com.own.ownproject.payload.ProductDTO;
import com.own.ownproject.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductDTO>> getProducts(Pageable pageable) {
        return ResponseEntity.ok(productService.getProducts(pageable));
    }

    @GetMapping("/mine")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ProductDTO>> getMyProducts(Pageable pageable, Authentication authentication) {
        return ResponseEntity.ok(productService.getMyProducts(pageable, authentication));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getOne(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(productService.getProductById(id, authentication));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('PRODUCT_CREATE')")
    public ResponseEntity<ProductDTO> create(@Valid @ModelAttribute CreateProductDTO dto,
                                             @RequestParam(value = "images", required = false) List<MultipartFile> images,
                                             Authentication authentication) {
        ProductDTO created = productService.createProduct(dto, images, authentication);
        return ResponseEntity.created(URI.create("/api/products/" + created.getId())).body(created);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_MANAGE')")
    public ResponseEntity<ProductDTO> update(@PathVariable Long id,
                                             @Valid @RequestBody CreateProductDTO dto,
                                             Authentication authentication) {
        return ResponseEntity.ok(productService.updateProduct(id, dto, authentication));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_MANAGE')")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        productService.deleteProduct(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
