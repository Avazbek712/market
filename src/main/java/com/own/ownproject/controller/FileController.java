package com.own.ownproject.controller;

import com.own.ownproject.entity.FileAsset;
import com.own.ownproject.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @GetMapping("/{id}")
    public ResponseEntity<InputStreamResource> get(@PathVariable Long id) {
        FileAsset asset = fileStorageService.getById(id);
        InputStreamResource resource = new InputStreamResource(fileStorageService.download(asset.getStorageKey()));

        MediaType mediaType = asset.getContentType() != null
                ? MediaType.parseMediaType(asset.getContentType())
                : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(resource);
    }
}
