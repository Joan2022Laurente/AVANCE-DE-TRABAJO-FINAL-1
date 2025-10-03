package com.utp.schedule_backend.repository;

import com.utp.schedule_backend.model.Task;
import java.util.List;

public interface TaskRepository {
    Task save(Task task);
    List<Task> findAll();
    Task findById(Long id);
}
