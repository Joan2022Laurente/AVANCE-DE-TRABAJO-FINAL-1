package com.utp.schedule_backend.repository;

import com.utp.schedule_backend.model.Resource;
import java.util.List;

public interface ResourceRepository {
    Resource save(Resource resource);
    List<Resource> findAll();
    Resource findById(Long id);
}
