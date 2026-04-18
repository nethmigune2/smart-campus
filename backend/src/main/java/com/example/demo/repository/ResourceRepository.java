package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Resource;
import com.example.demo.model.Resource.ResourceStatus;
import com.example.demo.model.Resource.ResourceType;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByStatus(ResourceStatus status);
    List<Resource> findByType(ResourceType type);
    List<Resource> findByStatusAndType(ResourceStatus status, ResourceType type);
    List<Resource> findByNameContainingIgnoreCase(String name);
}
