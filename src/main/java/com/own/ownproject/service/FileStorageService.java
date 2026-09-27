package com.own.ownproject.service;

import com.own.ownproject.entity.FileAsset;
import com.own.ownproject.entity.User;
import enums.FileCategory;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    FileAsset upload(MultipartFile file, User uploader, FileCategory category);

    void delete(String storageKey);
}
