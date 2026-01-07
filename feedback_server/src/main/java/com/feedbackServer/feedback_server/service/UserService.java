package com.feedbackServer.feedback_server.service;

import com.feedbackServer.feedback_server.dto.response.LoginResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.core.user.OAuth2User;

public interface UserService {

    ResponseEntity<LoginResponseDto> handleOAuth2LoginRequest(OAuth2User auth2User, String registrationId);
}
