package com.feedbackServer.feedback_server.security;

import com.feedbackServer.feedback_server.config.UrlConfig;
import com.feedbackServer.feedback_server.dto.response.LoginResponseDto;
import com.feedbackServer.feedback_server.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserService userService;
    private final ObjectMapper objectMapper;
    private final UrlConfig urlConfig;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        OAuth2User auth2User = (OAuth2User) authentication.getPrincipal();

        String registrationId = token.getAuthorizedClientRegistrationId();

        LoginResponseDto loginResponse = userService.handleOAuth2LoginRequest(auth2User,registrationId).getBody();

        String jwtToken = loginResponse.getJwt();
        String redirectUrl = urlConfig.getClientUrl()+"?token=" + jwtToken;

        response.sendRedirect(redirectUrl);
    }
}
