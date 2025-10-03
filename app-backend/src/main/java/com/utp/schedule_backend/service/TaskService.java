package com.utp.schedule_backend.service;

import com.utp.schedule_backend.model.Task;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private List<Task> tasks = new ArrayList<>();
    private Long nextId = 1L;

    // Crear tarea
    public Task crearTarea(Task task) {
        task.setId(nextId++);
        if (task.getEstado() == null) {
            task.setEstado("pendiente"); // valor por defecto
        }
        tasks.add(task);
        return task;
    }

    // Listar tareas
    public List<Task> listarTareas() {
        return tasks;
    }

    // Buscar por ID
    public Optional<Task> obtenerTarea(Long id) {
        return tasks.stream()
                .filter(t -> t.getId().equals(id))
                .findFirst();
    }

    // Actualizar estado
    public Optional<Task> actualizarEstado(Long id, String nuevoEstado) {
        Optional<Task> tareaOpt = obtenerTarea(id);
        tareaOpt.ifPresent(t -> t.setEstado(nuevoEstado));
        return tareaOpt;
    }
}
