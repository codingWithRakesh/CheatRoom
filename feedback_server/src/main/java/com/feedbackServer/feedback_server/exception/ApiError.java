package com.feedbackServer.feedback_server.exception;

import lombok.Data;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Data
public class ApiError {
    private LocalDateTime timeStamp;
    private String error;
    private HttpStatus httpStatus;

    public ApiError(){
        this.timeStamp = LocalDateTime.now();
    }

    public ApiError(String error, HttpStatus httpStatus){
        this();
        this.error = error;
        this.httpStatus = httpStatus;
    }
}
