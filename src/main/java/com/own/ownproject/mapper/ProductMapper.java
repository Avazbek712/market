package com.own.ownproject.mapper;

import com.own.ownproject.entity.Product;
import com.own.ownproject.entity.ProductImage;
import com.own.ownproject.payload.ProductDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProductMapper {
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "seller.id", target = "sellerId")
    @Mapping(source = "seller.fullName", target = "sellerName")
    @Mapping(target = "imageIds", expression = "java(mapImageIds(product.getImages()))")
    ProductDTO toProductDTO(Product product);

    List<ProductDTO> toProductDTO(List<Product> products);

    default List<Long> mapImageIds(List<ProductImage> images) {
        if (images == null) {
            return List.of();
        }
        return images.stream()
                .map(pi -> pi.getFileAsset().getId())
                .toList();
    }
}
