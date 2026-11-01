package com.own.ownproject.impl;

import com.own.ownproject.entity.Cart;
import com.own.ownproject.entity.CartItem;
import com.own.ownproject.entity.Order;
import com.own.ownproject.entity.OrderItem;
import com.own.ownproject.entity.Product;
import com.own.ownproject.entity.User;
import com.own.ownproject.enums.OrderStatus;
import com.own.ownproject.enums.PaymentStatus;
import com.own.ownproject.exception.OrderNotFoundException;
import com.own.ownproject.exception.UserNotFoundException;
import com.own.ownproject.payload.OrderDTO;
import com.own.ownproject.payload.OrderItemDTO;
import com.own.ownproject.repository.CartItemRepository;
import com.own.ownproject.repository.CartRepository;
import com.own.ownproject.repository.OrderRepository;
import com.own.ownproject.repository.ProductRepository;
import com.own.ownproject.repository.UserRepository;
import com.own.ownproject.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OrderDTO checkout(Authentication authentication) {
        User user = currentUser(authentication);

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("CART_EMPTY"));

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

        Order order = new Order();
        order.setUser(user);
        order.setPaymentStatus(PaymentStatus.UNPAID);

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product == null) {
                // Product was soft-deleted after being added to the cart — nothing
                // to actually order, skip it rather than failing the whole checkout.
                continue;
            }
            if (cartItem.getQuantity() > product.getQuantity()) {
                throw new IllegalStateException("INSUFFICIENT_STOCK");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setPrice(product.getPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setStatus(OrderStatus.PENDING);
            order.getItems().add(orderItem);

            product.setQuantity(product.getQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        if (order.getItems().isEmpty()) {
            throw new IllegalStateException("CART_EMPTY");
        }

        orderRepository.save(order);
        cartItemRepository.deleteAllByCartId(cart.getId());

        return toDTO(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDTO> getMyOrders(Pageable pageable, Authentication authentication) {
        User user = currentUser(authentication);
        return orderRepository.findAllByUserId(user.getId(), pageable).map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long id, Authentication authentication) {
        User user = currentUser(authentication);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order with id: " + id + " not found", HttpStatus.NOT_FOUND));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have permission to view this order");
        }

        return toDTO(order);
    }

    private OrderDTO toDTO(Order order) {
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(item -> new OrderItemDTO(
                        item.getProduct() != null ? item.getProduct().getId() : null,
                        item.getProductName(),
                        item.getPrice(),
                        item.getQuantity(),
                        item.getStatus()))
                .toList();

        BigDecimal total = order.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new OrderDTO(order.getId(), order.getPaymentStatus(), itemDTOs, total, order.getCreatedAt());
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findUserByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found", HttpStatus.NOT_FOUND));
    }
}
