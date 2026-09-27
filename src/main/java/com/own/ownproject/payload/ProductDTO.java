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

    private List<Long> imageIds;

}
