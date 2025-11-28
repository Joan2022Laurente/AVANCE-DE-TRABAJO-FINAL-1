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

    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<List<Task>> listarPorCurso(@PathVariable Long cursoId) {
        return ResponseEntity.ok(taskService.listarPorCurso(cursoId));
    }

    // Listar tareas por usuario
    @GetMapping("/usuario/{userId}")
    public ResponseEntity<List<Task>> listarPorUsuario(@PathVariable Long userId) {
        return ResponseEntity.ok(taskService.listarPorUsuario(userId));
    }

    // Listar tareas
    @GetMapping
    public ResponseEntity<List<Task>> listarTareas() {
        return ResponseEntity.ok(taskService.listarTareas());
    }

    // Eliminar tarea por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTarea(@PathVariable Long id) {
        boolean eliminada = taskService.eliminarTarea(id);
        if (eliminada) {
            return ResponseEntity.noContent().build(); // 204
        } else {
            return ResponseEntity.notFound().build(); // 404
        }
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
