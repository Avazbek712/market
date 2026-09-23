package com.own.ownproject.service;

import com.own.ownproject.payload.CategoryDTO;
import com.own.ownproject.payload.CreateCategoryDTO;

import java.util.List;

public interface CategoryService {
    List<CategoryDTO> getAll();

    CategoryDTO create(CreateCategoryDTO dto);

    CategoryDTO update(Long id, CreateCategoryDTO dto);

    void delete(Long id);

    CategoryDTO getById(Long id);
}
