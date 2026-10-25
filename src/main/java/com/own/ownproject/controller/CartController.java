package com.own.ownproject.controller;

import com.own.ownproject.payload.AddCartItemDTO;
import com.own.ownproject.payload.CartDTO;
import com.own.ownproject.payload.UpdateCartItemDTO;
import com.own.ownproject.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/cart")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('CART_MANAGE')")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartDTO> getMyCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.getMyCart(authentication));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDTO> addItem(@Valid @RequestBody AddCartItemDTO dto, Authentication authentication) {
        return ResponseEntity.ok(cartService.addItem(dto.getProductId(), dto.getQuantity(), authentication));
    }

    @PatchMapping("/items/{productId}")
    public ResponseEntity<CartDTO> updateItemQuantity(@PathVariable Long productId,
                                                       @Valid @RequestBody UpdateCartItemDTO dto,
                                                       Authentication authentication) {
        return ResponseEntity.ok(cartService.updateItemQuantity(productId, dto.getQuantity(), authentication));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartDTO> removeItem(@PathVariable Long productId, Authentication authentication) {
        return ResponseEntity.ok(cartService.removeItem(productId, authentication));
    }
}
