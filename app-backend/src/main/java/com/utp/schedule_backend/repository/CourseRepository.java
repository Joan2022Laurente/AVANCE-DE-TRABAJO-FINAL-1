package com.utp.schedule_backend.repository;

import com.utp.schedule_backend.model.Course;
import java.util.List;

public interface CourseRepository {
    Course save(Course course);
    List<Course> findAll();
    Course findById(Long id);
    List<Course> findByUserId(Long userId);
}
