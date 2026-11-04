package com.own.ownproject.entity;

import com.own.ownproject.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SQLDelete(sql = "UPDATE order_items SET active = false WHERE id = ?")
@SQLRestriction(value = "active=true")
public class OrderItem extends AbsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    // Kept for seller-side "orders containing my products" filtering (not built
    // yet) — never used for display, see productName/price below for that.
    // @NotFound(IGNORE): the product may be soft-deleted long after the order
    // was placed, but the order history must still load.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @NotFound(action = NotFoundAction.IGNORE)
    private Product product;

    // Snapshotted at purchase time — unlike CartItem, this must NOT reflect the
    // product's current name/price, which can change (or disappear) later.
    private String productName;
    private BigDecimal price;

    private Integer quantity;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;
}
