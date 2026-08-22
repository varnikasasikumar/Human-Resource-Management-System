package com.dayflow.authservice.repository;

import com.dayflow.authservice.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    
    Optional<User> findByLoginId(String loginId);
    
    Optional<User> findByEmail(String email);
    
}
