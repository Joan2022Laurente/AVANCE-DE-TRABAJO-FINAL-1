package com.utp.schedule_backend.service;

import com.utp.schedule_backend.model.Task;
import com.utp.schedule_backend.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public boolean eliminarTarea(Long id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Task> listarPorUsuario(Long userId) {
        return taskRepository.findByCourse_User_Id(userId);
    }

    public Task crearTarea(Task task) {
        if (task.getEstado() == null) {
            task.setEstado("pendiente");
        }
        return taskRepository.save(task);
    }

    public List<Task> listarPorCurso(Long cursoId) {
        return taskRepository.findByCourseId(cursoId);
    }

    public List<Task> listarTareas() {
        return taskRepository.findAll();
    }

    public Optional<Task> obtenerTarea(Long id) {
        return taskRepository.findById(id);
    }

    public Optional<Task> actualizarEstado(Long id, String nuevoEstado) {
        return taskRepository.findById(id).map(t -> {
            t.setEstado(nuevoEstado);
            return taskRepository.save(t);
        });
    }
}
