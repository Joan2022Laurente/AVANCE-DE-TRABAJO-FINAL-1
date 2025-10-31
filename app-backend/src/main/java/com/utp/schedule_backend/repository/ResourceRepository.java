package com.utp.schedule_backend.repository;

import com.utp.schedule_backend.model.Resource;
import com.utp.schedule_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByUser(User user);
}
