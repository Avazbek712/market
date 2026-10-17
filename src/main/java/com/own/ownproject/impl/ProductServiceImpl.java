package com.own.ownproject.impl;

import com.own.ownproject.entity.*;
import com.own.ownproject.exception.CategoryNotFoundException;
import com.own.ownproject.exception.ProductImageNotFoundException;
import com.own.ownproject.exception.ProductNotFoundException;
import com.own.ownproject.exception.UserNotFoundException;
import com.own.ownproject.mapper.ProductMapper;
import com.own.ownproject.payload.CreateProductDTO;
import com.own.ownproject.payload.ProductDTO;
import com.own.ownproject.payload.UpdateProductDTO;
import com.own.ownproject.repository.CategoryRepository;
import com.own.ownproject.repository.ProductRepository;
import com.own.ownproject.repository.UserRepository;
import com.own.ownproject.service.FileStorageService;
import com.own.ownproject.service.ProductService;
import enums.FileCategory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final int MAX_IMAGES_PER_PRODUCT = 10;

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> getProducts(Pageable pageable, Long categoryId, String search, BigDecimal minPrice, BigDecimal maxPrice) {
        Specification<Product> spec = buildProductSpecification(categoryId, search, minPrice, maxPrice);
        return productRepository.findAll(spec, pageable).map(productMapper::toProductDTO);
    }

    private Specification<Product> buildProductSpecification(Long categoryId, String search, BigDecimal minPrice, BigDecimal maxPrice) {
        Specification<Product> spec = (root, query, cb) -> cb.conjunction();

        if (categoryId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId));
        }
        if (search != null && !search.isBlank()) {
            String likePattern = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("name")), likePattern));
        }
        if (minPrice != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice));
        }
        return spec;
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
            if (images.size() > MAX_IMAGES_PER_PRODUCT) {
                throw new IllegalStateException("MAX_IMAGES_EXCEEDED");
            }

            List<String> uploadedKeys = new ArrayList<>();
            try {
                for (int i = 0; i < images.size(); i++) {
                    MultipartFile file = images.get(i);
                    if (file.isEmpty()) {
                        continue;
                    }
                    FileAsset fileAsset = fileStorageService.upload(file, seller, FileCategory.PRODUCT_IMAGE);
                    uploadedKeys.add(fileAsset.getStorageKey());

                    ProductImage productImage = new ProductImage();
                    productImage.setProduct(product);
                    productImage.setFileAsset(fileAsset);
                    productImage.setSortOrder(i);
                    product.getImages().add(productImage);
                }
            } catch (RuntimeException e) {
                cleanupOrphanedFiles(uploadedKeys);
                throw e;
            }
        }
        productRepository.save(product);
        return productMapper.toProductDTO(product);

    }

    @Override
    @Transactional
    public ProductDTO updateProduct(Long id, UpdateProductDTO updateProductDTO, Authentication authentication) {
        Product product = findByIdOrThrow(id);
        assertOwnerOrAdmin(product, authentication);

        applyPartialUpdate(product, updateProductDTO);
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
    public ProductDTO getProductById(Long id) {
        return productMapper.toProductDTO(findByIdOrThrow(id));
    }

    @Override
    @Transactional
    public ProductDTO addImages(Long productId, List<MultipartFile> images, Authentication authentication) {

        Product product = findByIdOrThrow(productId);

        assertOwnerOrAdmin(product, authentication);

        User user = userRepository
                .findUserByEmail(authentication.getName()).orElseThrow(() -> new UserNotFoundException("User not found", HttpStatus.NOT_FOUND));

        if (images.size() + product.getImages().size() > MAX_IMAGES_PER_PRODUCT) {
            throw new IllegalStateException("MAX_IMAGES_EXCEEDED");
        }

        int nextSortOrder = product.getImages().stream()
                .mapToInt(ProductImage::getSortOrder)
                .max()
                .orElse(-1) + 1;

        List<String> uploadedKeys = new ArrayList<>();
        try {
            for (int i = 0; i < images.size(); i++) {
                MultipartFile file = images.get(i);
                if (file.isEmpty()) continue;
                FileAsset fileAsset = fileStorageService.upload(file, user, FileCategory.PRODUCT_IMAGE);
                uploadedKeys.add(fileAsset.getStorageKey());

                ProductImage productImage = new ProductImage();
                productImage.setProduct(product);
                productImage.setFileAsset(fileAsset);
                productImage.setSortOrder(nextSortOrder + i);

                product.getImages().add(productImage);
            }
        } catch (RuntimeException e) {
            cleanupOrphanedFiles(uploadedKeys);
            throw e;
        }
        productRepository.save(product);

        return productMapper.toProductDTO(product);

    }

    @Override
    @Transactional
    public ProductDTO removeImages(Long productId, Long fileAssetId, Authentication authentication) {

        Product product = findByIdOrThrow(productId);
        assertOwnerOrAdmin(product, authentication);

        boolean removed = product.getImages().removeIf(productImage -> productImage.getFileAsset().getId().equals(fileAssetId));

        if (!removed) {
            throw new ProductImageNotFoundException("Product image not found", HttpStatus.NOT_FOUND);
        }
        productRepository.save(product);
        return productMapper.toProductDTO(product);
    }

    @Override
    @Transactional
    public ProductDTO reorderImages(Long productId, List<Long> fileAssetIdsInOrder, Authentication authentication) {

        Product product = findByIdOrThrow(productId);
        assertOwnerOrAdmin(product, authentication);

        Set<Long> existingIds = product.getImages().stream()
                .map(pi -> pi.getFileAsset().getId())
                .collect(Collectors.toSet());

        Set<Long> inComingSet = new HashSet<>(fileAssetIdsInOrder);

        if (fileAssetIdsInOrder.size() != inComingSet.size() || !existingIds.equals(inComingSet)) {
            throw new IllegalStateException("IMAGE_ORDER_MISMATCH");
        }

        for (int i = 0; i < fileAssetIdsInOrder.size(); i++) {
            Long fileAssetId = fileAssetIdsInOrder.get(i);
            ProductImage image = product.getImages()
                    .stream()
                    .filter(pi -> pi.getFileAsset().getId().equals(fileAssetId)).findFirst().orElseThrow();
            image.setSortOrder(i);

        }
        productRepository.save(product);
        return productMapper.toProductDTO(product);
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

    private void applyPartialUpdate(Product product, UpdateProductDTO dto) {
        if (dto.getName() != null) {
            product.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            product.setDescription(dto.getDescription());
        }
        if (dto.getPrice() != null) {
            product.setPrice(dto.getPrice());
        }
        if (dto.getQuantity() != null) {
            product.setQuantity(dto.getQuantity());
        }

        if (dto.getCategoryId() == null) {
            product.setCategory(null);
            return;
        }
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new CategoryNotFoundException("Category not found", HttpStatus.BAD_REQUEST));
        product.setCategory(category);
    }

    // Best-effort compensation for the MinIO/DB inconsistency: the DB side of a
    // failed upload rolls back with the surrounding @Transactional, but a file
    // already PUT to MinIO is a real external side effect that doesn't. One
    // cleanup failure must not hide the original upload error, so each delete is
    // isolated and only logged.
    private void cleanupOrphanedFiles(List<String> storageKeys) {
        for (String storageKey : storageKeys) {
            try {
                fileStorageService.delete(storageKey);
            } catch (Exception cleanupException) {
                log.error("Failed to clean up orphaned file after a failed upload: {}", storageKey, cleanupException);
            }
        }
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

