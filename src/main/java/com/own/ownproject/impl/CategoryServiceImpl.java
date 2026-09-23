package com.own.ownproject.impl;

import com.own.ownproject.entity.Category;
import com.own.ownproject.exception.CategoryNotFoundException;
import com.own.ownproject.mapper.CategoryMapper;
import com.own.ownproject.payload.CategoryDTO;
import com.own.ownproject.payload.CreateCategoryDTO;
import com.own.ownproject.repository.CategoryRepository;
import com.own.ownproject.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private CategoryRepository categoryRepository;
    private CategoryMapper categoryMapper;

    @Autowired
    public CategoryServiceImpl(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    @Override
    public List<CategoryDTO> getAll() {

        List<Category> categories = categoryRepository.getAllByActive(true);

        return categoryMapper.toCategoryDTO(categories);
    }

    @Override
    public CategoryDTO create(CreateCategoryDTO dto) {
        Category category = new Category();
        applyToEntity(category, dto);
        category = categoryRepository.save(category);

        return categoryMapper.toCategoryDTO(category);
    }

    @Override
    public CategoryDTO update(Long id, CreateCategoryDTO dto) {
        Category category = findByIdOrThrow(id);
        applyToEntity(category, dto);
        category = categoryRepository.save(category);

        return categoryMapper.toCategoryDTO(category);
    }

    @Override
    public void delete(Long id) {
        Category category = findByIdOrThrow(id);
        categoryRepository.delete(category);
    }

    @Override
    public CategoryDTO getById(Long id) {
        return categoryMapper.toCategoryDTO(findByIdOrThrow(id));
    }

    private void applyToEntity(Category category, CreateCategoryDTO dto) {
        category.setName(dto.getCategoryName());

        if (dto.getCategoryDescription() != null && !dto.getCategoryDescription().isBlank()) {
            category.setDescription(dto.getCategoryDescription());
        } else {
            category.setDescription(null);
        }
    }

    private Category findByIdOrThrow(Long id) {
        return categoryRepository.findById(id).orElseThrow(
                () -> new CategoryNotFoundException("Category with id: " + id + " not found", HttpStatus.NOT_FOUND));
    }
}
