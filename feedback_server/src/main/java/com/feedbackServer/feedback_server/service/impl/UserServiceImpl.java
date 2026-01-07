package com.feedbackServer.feedback_server.service.impl;

import com.feedbackServer.feedback_server.dto.request.SignUpRequestDto;
import com.feedbackServer.feedback_server.dto.response.LoginResponseDto;
import com.feedbackServer.feedback_server.entity.User;
import com.feedbackServer.feedback_server.entity.type.AuthProviderType;
import com.feedbackServer.feedback_server.repository.UserRepository;
import com.feedbackServer.feedback_server.security.AuthUtil;
import com.feedbackServer.feedback_server.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final AuthUtil authUtil;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public User signUpInternal(SignUpRequestDto signUpRequestDto, AuthProviderType authProviderType, String providerId){
        User user = userRepository.findByEmail(signUpRequestDto.getEmail()).orElse(null);

        if (user != null) throw new IllegalArgumentException("User already exists");

        user = User.builder()
                .email(signUpRequestDto.getEmail())
                .providerId(providerId)
                .authProviderType(authProviderType)
                .build();

        if (authProviderType == AuthProviderType.EMAIL){
            user.setPassword(passwordEncoder.encode(signUpRequestDto.getPassword()));
        }

        return userRepository.save(user);
    }

    @Override
    public ResponseEntity<LoginResponseDto> handleOAuth2LoginRequest(OAuth2User auth2User, String registrationId) {
        AuthProviderType providerType = authUtil.getProviderTypeFromRegistrationId(registrationId);
        String providerId = authUtil.determineProviderIdFromOAuth2User(auth2User, registrationId);

        User user = userRepository.findByProviderIdAndAuthProviderType(providerId,providerType).orElse(null);
        String email = auth2User.getAttribute("email");

        User emailUser = userRepository.findByEmail(email).orElse(null);

        if (user == null && emailUser == null){
            String userEmail = authUtil.determineEmailFromOAuth2User(auth2User,registrationId,providerId);
            String name = authUtil.determineNameFromOAuth2User(auth2User,registrationId);
            String avatar = authUtil.determineAvatarFromOAuth2User(auth2User, registrationId);
            user = User.builder()
                    .email(userEmail)
                    .name(name)
                    .avatar(avatar)
                    .providerId(providerId)
                    .authProviderType(AuthProviderType.valueOf(registrationId.toUpperCase()))
                    .build();

            userRepository.save(user);

        } else if (user != null) {
            if (email != null && !email.isBlank() && !email.equals(user.getEmail())){
                user.setEmail(email);
                userRepository.save(user);
            }
        } else {
            throw new BadCredentialsException("This email is already registered with provider "+emailUser.getAuthProviderType());
        }

        LoginResponseDto loginResponseDto = new LoginResponseDto(authUtil.generateAccessToken(user),user.getId());
        return ResponseEntity.status(HttpStatus.OK).body(loginResponseDto);
    }
}
