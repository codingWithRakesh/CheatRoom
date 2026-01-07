package com.feedbackServer.feedback_server.dto.request;

import com.feedbackServer.feedback_server.entity.type.FeedBackType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeedBackRequestDto {
    private String message;
    private FeedBackType feedBackType;
    private String userId;
    private MultipartFile attachment;
}
