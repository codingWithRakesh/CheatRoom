package com.feedbackServer.feedback_server.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/run")
public class RunServer {

    @GetMapping("/server")
    public ResponseEntity<Map<String,Object>> runTheServer(){
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("message","running"));
    }
}
