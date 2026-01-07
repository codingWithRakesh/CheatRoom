package com.feedbackServer.feedback_server.controller;

import com.feedbackServer.feedback_server.dto.request.FeedBackRequestDto;
import com.feedbackServer.feedback_server.dto.response.FeedBackResponseDto;
import com.feedbackServer.feedback_server.service.FeedBackService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/feedback")
@AllArgsConstructor
public class FeedBackController {
    private final FeedBackService feedBackService;

    @PostMapping(
            value = "/create",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<FeedBackResponseDto> createFeedBack(@Valid @ModelAttribute FeedBackRequestDto dto){
        return ResponseEntity.status(HttpStatus.CREATED).body(feedBackService.createFeedBack(dto));
    }
}
