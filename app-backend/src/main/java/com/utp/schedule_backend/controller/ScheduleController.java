package com.utp.schedule_backend.controller;

import com.utp.schedule_backend.model.Schedule;
import com.utp.schedule_backend.service.ScheduleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    // POST /api/schedules → crear horario
    @PostMapping
    public Schedule createSchedule(@RequestBody Schedule schedule) {
        return scheduleService.save(schedule);
    }

    // GET /api/schedules → listar horarios
    @GetMapping
    public List<Schedule> getAllSchedules() {
        return scheduleService.findAll();
    }

    // GET /api/schedules/{id} → obtener horario
    @GetMapping("/{id}")
    public Schedule getScheduleById(@PathVariable Long id) {
        return scheduleService.findById(id);
    }
}
