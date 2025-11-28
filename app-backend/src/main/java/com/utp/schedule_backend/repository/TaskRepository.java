package com.utp.schedule_backend.repository;

import com.utp.schedule_backend.model.Task;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByCourseId(Long courseId);

    List<Task> findByCourse_User_Id(Long userId);
}
