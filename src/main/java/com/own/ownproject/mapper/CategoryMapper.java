package com.own.ownproject.mapper;

import com.own.ownproject.entity.Category;
import com.own.ownproject.payload.CategoryDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CategoryMapper {

    @Mapping(source = "parent.id" , target = "parentId")
    CategoryDTO toCategoryDTO(Category category);

    List<CategoryDTO> toCategoryDTO(List<Category> categories);

}
