package com.own.ownproject.impl;

import com.own.ownproject.entity.FileAsset;
import com.own.ownproject.entity.User;
import com.own.ownproject.exception.FileStorageException;
import com.own.ownproject.repository.FileAssetRepository;
import com.own.ownproject.service.FileStorageService;
import enums.FileCategory;
import io.minio.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {


    private final MinioClient minioClient;
    private final FileAssetRepository fileAssetRepository;
    @Value("${minio.bucket}")
    private String bucket;

    @PostConstruct
    void ensureBucketExists() throws Exception {
        boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());

        if (!exists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
        }
    }

    @Override
    public FileAsset upload(MultipartFile file, User uploader, FileCategory category) {
        String storageKey = category.getFolder() + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket).object(storageKey)
                    .stream(inputStream, file.getSize(), -1L)
                    .contentType(file.getContentType())
                    .build());

        } catch (Exception e) {
            throw new FileStorageException("Failed to upload file: " + file.getOriginalFilename(), HttpStatus.BAD_REQUEST, e);
        }

        FileAsset asset = new FileAsset();
        asset.setStorageKey(storageKey);
        asset.setCategory(category);
        asset.setOriginalFileName(file.getOriginalFilename());
        asset.setContentType(file.getContentType());
        asset.setUploadedBy(uploader);
        asset.setSizeBytes(file.getSize());
        fileAssetRepository.save(asset);
        return asset;

    }

    @Override
    public void delete(String storageKey) {
        FileAsset asset = fileAssetRepository.findByStorageKey(storageKey).orElseThrow(() ->
                new FileStorageException("File not found: " + storageKey, HttpStatus.NOT_FOUND));

        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(storageKey)
                            .build());
        }catch (Exception e) {
            throw new FileStorageException("Failed to remove file: " + storageKey, HttpStatus.BAD_REQUEST, e);
        }
        fileAssetRepository.delete(asset);

    }
}
