package com.feedbackServer.feedback_server.service;

import com.feedbackServer.feedback_server.dto.request.FeedBackRequestDto;
import com.feedbackServer.feedback_server.dto.response.FeedBackResponseDto;
import org.jspecify.annotations.Nullable;

public interface FeedBackService {

    FeedBackResponseDto createFeedBack(FeedBackRequestDto dto);
}
