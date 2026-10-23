package com.own.ownproject.controller;

import com.own.ownproject.payload.ProductDTO;
import com.own.ownproject.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    @PreAuthorize("hasAuthority('FAVORITE_MANAGE')")
    public ResponseEntity<Page<ProductDTO>> getMyFavorites(Pageable pageable, Authentication authentication) {
        return ResponseEntity.ok(favoriteService.getMyFavorites(pageable, authentication));
    }

    @PostMapping("/{productId}")
    @PreAuthorize("hasAuthority('FAVORITE_MANAGE')")
    public ResponseEntity<Void> addFavorite(@PathVariable Long productId, Authentication authentication) {
        favoriteService.addFavorite(productId, authentication);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{productId}")
    @PreAuthorize("hasAuthority('FAVORITE_MANAGE')")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long productId, Authentication authentication) {
        favoriteService.removeFavorite(productId, authentication);
        return ResponseEntity.noContent().build();
    }
}
