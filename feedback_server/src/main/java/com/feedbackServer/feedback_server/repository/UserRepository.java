package com.feedbackServer.feedback_server.repository;

import com.feedbackServer.feedback_server.entity.User;
import com.feedbackServer.feedback_server.entity.type.AuthProviderType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User,String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByProviderIdAndAuthProviderType(String providerId, AuthProviderType providerType);
}
