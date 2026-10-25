package com.own.ownproject.service;

import com.own.ownproject.payload.CartDTO;
import org.springframework.security.core.Authentication;

public interface CartService {

    CartDTO getMyCart(Authentication authentication);

    CartDTO addItem(Long productId, Integer quantity, Authentication authentication);

    CartDTO updateItemQuantity(Long productId, Integer quantity, Authentication authentication);

    CartDTO removeItem(Long productId, Authentication authentication);
}
