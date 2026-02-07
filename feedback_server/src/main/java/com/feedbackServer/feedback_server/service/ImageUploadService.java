package com.feedbackServer.feedback_server.service;

import com.feedbackServer.feedback_server.config.UrlConfig;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Service
public class ImageUploadService {


    private final UrlConfig urlConfig;

    private final RestTemplate restTemplate = new RestTemplate();

    public ImageUploadService(UrlConfig urlConfig) {
        this.urlConfig = urlConfig;
    }

    public Map<String,Object> uploadImage(MultipartFile file) {

        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            body.add("image", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response =
                    restTemplate.postForEntity(
                            urlConfig.getServerUrl(),
                            requestEntity,
                            Map.class
                    );

            if (response.getBody() == null) {
                throw new RuntimeException("Invalid response from image server");
            }

            Map bodyMap = response.getBody();
            Map dataMap = (Map) bodyMap.get("data");

            if (dataMap == null || dataMap.get("fileUrl") == null) {
                throw new RuntimeException("Image URL not found in response");
            }

            Map<String,Object> datas = new HashMap<>();

            datas.put("fileUrl",dataMap.get("fileUrl"));
            datas.put("fileId",dataMap.get("fileId"));

            return datas;

        } catch (Exception e) {
            throw new RuntimeException("Image upload via Node.js failed", e);
        }
    }
}
