package com.own.ownproject.impl;

import com.own.ownproject.entity.*;
import com.own.ownproject.exception.CategoryNotFoundException;
import com.own.ownproject.exception.ProductNotFoundException;
import com.own.ownproject.exception.UserNotFoundException;
import com.own.ownproject.mapper.ProductMapper;
import com.own.ownproject.payload.CreateProductDTO;
import com.own.ownproject.payload.ProductDTO;
import com.own.ownproject.repository.CategoryRepository;
import com.own.ownproject.repository.ProductRepository;
import com.own.ownproject.repository.UserRepository;
import com.own.ownproject.service.FileStorageService;
import com.own.ownproject.service.ProductService;
import enums.FileCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> getProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(productMapper::toProductDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> getMyProducts(Pageable pageable, Authentication authentication) {
        User currentUser = userRepository.findUserByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found", HttpStatus.NOT_FOUND));

        return productRepository.findAllBySellerId(currentUser.getId(), pageable).map(productMapper::toProductDTO);
    }

    @Override
    @Transactional
    public ProductDTO createProduct(CreateProductDTO createProductDTO, List<MultipartFile> images, Authentication authentication) {

        User seller = userRepository.findUserByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found", HttpStatus.NOT_FOUND));

        Product product = new Product();
        applyToEntity(product, createProductDTO);
        product.setSeller(seller);

        if (images != null) {

            for (int i = 0; i < images.size(); i++) {
                MultipartFile file = images.get(i);
                if (file.isEmpty()) {
                    continue;
                }
                FileAsset fileAsset = fileStorageService.upload(file, seller, FileCategory.PRODUCT_IMAGE);

                ProductImage productImage = new ProductImage();
                productImage.setProduct(product);
                productImage.setFileAsset(fileAsset);
                productImage.setSortOrder(i);
                product.getImages().add(productImage);
            }
        }
        productRepository.save(product);
        return productMapper.toProductDTO(product);

    }

    @Override
    @Transactional
    public ProductDTO updateProduct(Long id, CreateProductDTO createProductDTO, Authentication authentication) {
        Product product = findByIdOrThrow(id);
        assertOwnerOrAdmin(product, authentication);

        applyToEntity(product, createProductDTO);
        productRepository.save(product);
        return productMapper.toProductDTO(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id, Authentication authentication) {
        Product product = findByIdOrThrow(id);
        assertOwnerOrAdmin(product, authentication);

        productRepository.delete(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id, Authentication authentication) {
        return productMapper.toProductDTO(findByIdOrThrow(id));
    }

    private void applyToEntity(Product product, CreateProductDTO dto) {
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setQuantity(dto.getQuantity());

        if (dto.getCategoryId() == null) {
            product.setCategory(null);
            return;
        }
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new CategoryNotFoundException("Category not found", HttpStatus.BAD_REQUEST));
        product.setCategory(category);
    }

    private Product findByIdOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product with id: " + id + " not found", HttpStatus.NOT_FOUND));
    }

    private void assertOwnerOrAdmin(Product product, Authentication authentication) {
        User currentUser = userRepository.findUserByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found", HttpStatus.NOT_FOUND));

        boolean isAdmin = currentUser.getRole() != null && "ADMIN".equals(currentUser.getRole().getName());
        boolean isOwner = product.getSeller() != null && product.getSeller().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("You do not have permission to manage this product");
        }
    }
}

