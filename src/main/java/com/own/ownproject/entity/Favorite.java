package com.own.ownproject.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

@Entity
@Table(name = "favorites")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Favorite extends AbsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // If the product was later soft-deleted (active=false), @SQLRestriction on
    // Product makes the row invisible to Hibernate's loader — without this,
    // initializing the proxy would throw EntityNotFoundException instead of
    // just returning null. The Favorite row itself is kept as a historical fact.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @NotFound(action = NotFoundAction.IGNORE)
    private Product product;

}
