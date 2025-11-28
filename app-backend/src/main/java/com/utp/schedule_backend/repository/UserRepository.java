package com.utp.schedule_backend.repository;

import com.utp.schedule_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByCodigo(String codigo);
}
