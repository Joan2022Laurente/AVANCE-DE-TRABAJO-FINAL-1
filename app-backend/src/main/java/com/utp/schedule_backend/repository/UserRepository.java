package com.utp.schedule_backend.repository;

import com.utp.schedule_backend.model.User;
import java.util.List;

public interface UserRepository {
    User save(User user);
    List<User> findAll();
    User findById(Long id);
}
