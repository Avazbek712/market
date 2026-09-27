package com.own.ownproject.repository;

import com.own.ownproject.entity.FileAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FileAssetRepository extends JpaRepository<FileAsset, Long> {
    Optional<FileAsset> findByStorageKey(String storageKey);
}