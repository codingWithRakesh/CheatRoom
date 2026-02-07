package com.feedbackServer.feedback_server.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "url.upload")
@Getter
@Setter
public class UrlConfig {
    private String serverUrl;
    private String clientUrl;
}
