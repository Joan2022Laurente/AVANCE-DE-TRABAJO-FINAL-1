package com.utp.schedule_backend.controller;

import com.utp.schedule_backend.model.Task;
import com.utp.schedule_backend.service.TaskService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    // Crear tarea
    @PostMapping
    public ResponseEntity<Task> crearTarea(@RequestBody Task task) {
        return ResponseEntity.ok(taskService.crearTarea(task));
    }

    // Listar tareas
    @GetMapping
    public ResponseEntity<List<Task>> listarTareas() {
        return ResponseEntity.ok(taskService.listarTareas());
    }

    // Actualizar estado de tarea
    @PutMapping("/{id}")
    public ResponseEntity<Task> actualizarEstado(
            @PathVariable Long id,
            @RequestParam String estado) {
        Optional<Task> tarea = taskService.actualizarEstado(id, estado);
        return tarea.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
