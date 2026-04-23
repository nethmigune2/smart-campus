package com.example.demo.controller;

import com.example.demo.model.Ticket;
import com.example.demo.model.TicketComment;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.FileStorageService;
import com.example.demo.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TicketController {

    private final TicketService ticketService;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    // ── Ticket CRUD ──

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<List<Ticket>> getAll() {
        return ResponseEntity.ok(ticketService.getAll());
    }

    @GetMapping("/my")
    public ResponseEntity<List<Ticket>> getMy() {
        return ResponseEntity.ok(ticketService.getByUser(getCurrentUser().getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Ticket ticket = ticketService.getById(id);
        User current = getCurrentUser();
        boolean isAdminOrStaff = current.getRole() == User.Role.ADMIN || current.getRole() == User.Role.STAFF;
        if (!isAdminOrStaff && !ticket.getCreatedBy().getId().equals(current.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
        return ResponseEntity.ok(ticket);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Ticket> create(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String category,
            @RequestParam String priority,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) String contactName,
            @RequestParam(required = false) String contactPhone,
            @RequestParam(required = false) List<MultipartFile> attachments) {
        Ticket ticket = ticketService.create(title, description, category, priority,
                location, resourceId, contactName, contactPhone, getCurrentUser(), attachments);
        return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<Ticket> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ticketService.updateStatus(
                id,
                body.get("status"),
                body.get("reason"),
                body.get("resolutionNotes"),
                getCurrentUser()));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> assign(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(ticketService.assign(id, body.get("assigneeId"), getCurrentUser()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        ticketService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Ticket deleted"));
    }

    // ── Comments ──

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketComment>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getComments(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String content = body.get("content");
        if (content == null || content.isBlank())
            return ResponseEntity.badRequest().build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.addComment(id, content, getCurrentUser()));
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<?> editComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ticketService.editComment(commentId, body.get("content"), getCurrentUser()));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Map<String, String>> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId) {
        ticketService.deleteComment(commentId, getCurrentUser());
        return ResponseEntity.ok(Map.of("message", "Comment deleted"));
    }

    // ── File serving ──

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        Resource file = fileStorageService.load(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }
}
