package com.own.ownproject.service;

import com.own.ownproject.payload.OrderDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;

public interface OrderService {

    OrderDTO checkout(Authentication authentication);

    Page<OrderDTO> getMyOrders(Pageable pageable, Authentication authentication);

    OrderDTO getOrderById(Long id, Authentication authentication);
}
