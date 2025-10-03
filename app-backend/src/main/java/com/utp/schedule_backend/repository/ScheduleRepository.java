package com.utp.schedule_backend.repository;

import com.utp.schedule_backend.model.Schedule;
import java.util.List;

public interface ScheduleRepository {
    Schedule save(Schedule schedule);

    List<Schedule> findAll();

    Schedule findById(Long id);
}
