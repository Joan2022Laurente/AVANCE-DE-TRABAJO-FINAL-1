package com.utp.schedule_backend.service;

import com.utp.schedule_backend.model.Schedule;
import com.utp.schedule_backend.repository.ScheduleRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ScheduleService implements ScheduleRepository {

    private List<Schedule> schedules = new ArrayList<>();
    private Long currentId = 1L;

    @Override
    public Schedule save(Schedule schedule) {
        schedule.setId(currentId++);
        schedules.add(schedule);
        return schedule;
    }

    @Override
    public List<Schedule> findAll() {
        return schedules;
    }

    @Override
    public Schedule findById(Long id) {
        return schedules.stream()
                .filter(s -> s.getId().equals(id))
                .findFirst()
                .orElse(null);
    }
}
