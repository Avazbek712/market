package com.own.ownproject.impl;

import com.own.ownproject.entity.Favorite;
import com.own.ownproject.entity.Product;
import com.own.ownproject.entity.User;
import com.own.ownproject.exception.ProductNotFoundException;
import com.own.ownproject.exception.UserNotFoundException;
import com.own.ownproject.mapper.ProductMapper;
import com.own.ownproject.payload.ProductDTO;
import com.own.ownproject.repository.FavoriteRepository;
import com.own.ownproject.repository.ProductRepository;
import com.own.ownproject.repository.UserRepository;
import com.own.ownproject.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional
    public void addFavorite(Long productId, Authentication authentication) {
        User user = currentUser(authentication);

        if (favoriteRepository.findByUserIdAndProductId(user.getId(), productId).isPresent()) {
            return;
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product with id: " + productId + " not found", HttpStatus.NOT_FOUND));

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setProduct(product);
        favoriteRepository.save(favorite);
    }

    @Override
    @Transactional
    public void removeFavorite(Long productId, Authentication authentication) {
        User user = currentUser(authentication);

        // Idempotent, symmetric with addFavorite — removing a non-favorite is a no-op.
        favoriteRepository.findByUserIdAndProductId(user.getId(), productId)
                .ifPresent(favoriteRepository::delete);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> getMyFavorites(Pageable pageable, Authentication authentication) {
        User user = currentUser(authentication);

        Page<Favorite> favorites = favoriteRepository.findAllByUserId(user.getId(), pageable);

        List<ProductDTO> productDTOs = favorites.getContent().stream()
                .map(Favorite::getProduct)
                .filter(Objects::nonNull)
                .map(productMapper::toProductDTO)
                .toList();

        return new PageImpl<>(productDTOs, pageable, favorites.getTotalElements());
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findUserByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found", HttpStatus.NOT_FOUND));
    }
}
