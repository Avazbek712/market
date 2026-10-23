package com.own.ownproject.service;

import com.own.ownproject.payload.ProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

public interface FavoriteService {

    void addFavorite(Long productId, Authentication authentication);

    void removeFavorite(Long productId, Authentication authentication);

    Page<ProductDTO> getMyFavorites(Pageable pageable, Authentication authentication);
}
