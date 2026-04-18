package com.example.demo.controller;

import com.example.demo.model.Resource;
import com.example.demo.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<Resource>> getAll() {
        return ResponseEntity.ok(resourceService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Resource>> search(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(resourceService.search(type, location, minCapacity, status));
    }

    @PostMapping
    public ResponseEntity<Resource> create(@Valid @RequestBody Resource resource) {
        Resource created = resourceService.create(resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> update(@PathVariable Long id, @Valid @RequestBody Resource resource) {
        return ResponseEntity.ok(resourceService.update(id, resource));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        resourceService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Resource deleted successfully"));
    }
}
