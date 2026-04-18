package com.example.demo.service;

import com.example.demo.model.Resource;
import com.example.demo.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<Resource> getAll() {
        return resourceRepository.findAll();
    }

    public Resource getById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    public Resource create(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource update(Long id, Resource updated) {
        Resource existing = getById(id);
        existing.setName(updated.getName());
        existing.setType(updated.getType());
        existing.setCapacity(updated.getCapacity());
        existing.setLocation(updated.getLocation());
        existing.setAvailabilityStart(updated.getAvailabilityStart());
        existing.setAvailabilityEnd(updated.getAvailabilityEnd());
        existing.setDescription(updated.getDescription());
        existing.setStatus(updated.getStatus());
        return resourceRepository.save(existing);
    }

    public void delete(Long id) {
        getById(id);
        resourceRepository.deleteById(id);
    }

    public List<Resource> search(String type, String location, Integer minCapacity, String status) {
        Resource.ResourceType typeEnum = null;
        if (type != null && !type.isBlank()) {
            typeEnum = Resource.ResourceType.valueOf(type.toUpperCase());
        }
        Resource.ResourceStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            statusEnum = Resource.ResourceStatus.valueOf(status.toUpperCase());
        }
        return resourceRepository.search(typeEnum, location, minCapacity, statusEnum);
    }
}
