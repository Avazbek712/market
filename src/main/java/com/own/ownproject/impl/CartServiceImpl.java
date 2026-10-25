package com.own.ownproject.impl;

import com.own.ownproject.entity.Cart;
import com.own.ownproject.entity.CartItem;
import com.own.ownproject.entity.Product;
import com.own.ownproject.entity.User;
import com.own.ownproject.exception.ProductNotFoundException;
import com.own.ownproject.exception.UserNotFoundException;
import com.own.ownproject.payload.CartDTO;
import com.own.ownproject.payload.CartItemDTO;
import com.own.ownproject.repository.CartItemRepository;
import com.own.ownproject.repository.CartRepository;
import com.own.ownproject.repository.ProductRepository;
import com.own.ownproject.repository.UserRepository;
import com.own.ownproject.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public CartDTO getMyCart(Authentication authentication) {
        User user = currentUser(authentication);

        // No cart yet (never added anything) — an empty cart, not a 404. We never
        // create the row just for reading.
        return cartRepository.findByUserId(user.getId())
                .map(cart -> toDTO(cartItemRepository.findByCartId(cart.getId())))
                .orElseGet(() -> toDTO(List.of()));
    }

    @Override
    @Transactional
    public CartDTO addItem(Long productId, Integer quantity, Authentication authentication) {
        User user = currentUser(authentication);
        Product product = findProductOrThrow(productId);
        Cart cart = findOrCreateCart(user);

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setProduct(product);
                    newItem.setQuantity(0);
                    return newItem;
                });

        int newQuantity = item.getQuantity() + quantity;
        assertStockAvailable(product, newQuantity);
        item.setQuantity(newQuantity);
        cartItemRepository.save(item);

        return toDTO(cartItemRepository.findByCartId(cart.getId()));
    }

    @Override
    @Transactional
    public CartDTO updateItemQuantity(Long productId, Integer quantity, Authentication authentication) {
        User user = currentUser(authentication);
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("CART_ITEM_NOT_FOUND"));

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new IllegalStateException("CART_ITEM_NOT_FOUND"));

        assertStockAvailable(item.getProduct(), quantity);
        item.setQuantity(quantity);
        cartItemRepository.save(item);

        return toDTO(cartItemRepository.findByCartId(cart.getId()));
    }

    @Override
    @Transactional
    public CartDTO removeItem(Long productId, Authentication authentication) {
        User user = currentUser(authentication);

        cartRepository.findByUserId(user.getId()).ifPresent(cart ->
                cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                        .ifPresent(cartItemRepository::delete));

        return getMyCart(authentication);
    }

    private Cart findOrCreateCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }

    private void assertStockAvailable(Product product, int requestedQuantity) {
        if (requestedQuantity > product.getQuantity()) {
            throw new IllegalStateException("INSUFFICIENT_STOCK");
        }
    }

    private CartDTO toDTO(List<CartItem> cartItems) {
        List<CartItemDTO> itemDTOs = cartItems.stream()
                .filter(item -> item.getProduct() != null) // product may have been soft-deleted since
                .map(this::toItemDTO)
                .toList();

        BigDecimal total = itemDTOs.stream()
                .map(CartItemDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartDTO(itemDTOs, total);
    }

    private CartItemDTO toItemDTO(CartItem item) {
        Product product = item.getProduct();
        BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));

        List<Long> imageIds = product.getImages().stream()
                .map(image -> image.getFileAsset().getId())
                .toList();

        return new CartItemDTO(
                product.getId(),
                product.getName(),
                product.getPrice(),
                item.getQuantity(),
                subtotal,
                imageIds
        );
    }

    private Product findProductOrThrow(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product with id: " + productId + " not found", HttpStatus.NOT_FOUND));
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findUserByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found", HttpStatus.NOT_FOUND));
    }
}
