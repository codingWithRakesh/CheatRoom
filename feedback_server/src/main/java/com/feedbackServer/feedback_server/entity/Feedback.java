package com.feedbackServer.feedback_server.entity;

import com.feedbackServer.feedback_server.entity.type.FeedBackType;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "feedbacks")
@Builder
@Data
public class Feedback {

    @Id
    private String id;

    private String message;

    private String attachment;

    private String attachmentId;

    private FeedBackType feedBackType;

    private String userId;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
