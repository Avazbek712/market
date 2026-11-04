package com.own.ownproject.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {

    private Long id;

    private String name;

    private String description;

    private BigDecimal price;

    private Integer quantity;

    private Long categoryId;

    private Long sellerId;

    private String sellerName;

    private List<Long> imageIds;

    // Only populated by getProducts/getProductById (catalog + detail page) —
    // batched per request to avoid an N+1 count query per product, see
    // ProductServiceImpl.enrichWithCounts. Null elsewhere (e.g. getMyProducts),
    // since the seller dashboard doesn't display them.
    private Long favoritesCount;

    private Long ordersCount;

}
