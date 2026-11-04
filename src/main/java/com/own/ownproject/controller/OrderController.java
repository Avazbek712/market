package com.own.ownproject.controller;

import com.own.ownproject.payload.OrderDTO;
import com.own.ownproject.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/orders")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ORDER_MANAGE')")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderDTO> checkout(Authentication authentication) {
        OrderDTO created = orderService.checkout(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<Page<OrderDTO>> getMyOrders(Pageable pageable, Authentication authentication) {
        return ResponseEntity.ok(orderService.getMyOrders(pageable, authentication));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(orderService.getOrderById(id, authentication));
    }
}
