package com.feedbackServer.feedback_server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeedBackResponseDto {
    private String userId;
    private String message;
}
