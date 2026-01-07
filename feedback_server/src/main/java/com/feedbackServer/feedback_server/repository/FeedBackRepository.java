package com.feedbackServer.feedback_server.repository;

import com.feedbackServer.feedback_server.entity.Feedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedBackRepository extends MongoRepository<Feedback,String> {

}
