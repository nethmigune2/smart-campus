package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    public List<Ticket> getAll() {
        return ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Ticket> getByUser(Long userId) {
        return ticketRepository.findByCreatedByIdOrderByCreatedAtDesc(userId);
    }

    public Ticket getById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
    }

    public Ticket create(String title, String description, String category, String priority,
                         String location, Long resourceId, String contactName, String contactPhone,
                         User creator, List<MultipartFile> files) {

        Ticket.TicketCategory cat;
        try { cat = Ticket.TicketCategory.valueOf(category.toUpperCase()); }
        catch (IllegalArgumentException e) { throw new IllegalArgumentException("Invalid category: " + category); }

        Ticket.TicketPriority pri;
        try { pri = Ticket.TicketPriority.valueOf(priority.toUpperCase()); }
        catch (IllegalArgumentException e) { throw new IllegalArgumentException("Invalid priority: " + priority); }

        Resource resource = null;
        if (resourceId != null) {
            resource = resourceRepository.findById(resourceId).orElse(null);
        }

        List<String> attachments = new ArrayList<>();
        if (files != null) {
            if (files.size() > 3) throw new IllegalArgumentException("Maximum 3 attachments allowed");
            for (MultipartFile file : files) {
                if (!file.isEmpty()) attachments.add(fileStorageService.store(file));
            }
        }

        Ticket ticket = Ticket.builder()
                .createdBy(creator)
                .title(title)
                .description(description)
                .category(cat)
                .priority(pri)
                .location(location)
                .resource(resource)
                .contactName(contactName)
                .contactPhone(contactPhone)
                .attachments(attachments)
                .build();

        return ticketRepository.save(ticket);
    }

    public Ticket updateStatus(Long id, String newStatus, String reason, String notes, User actor) {
        Ticket ticket = getById(id);

        Ticket.TicketStatus status;
        try { status = Ticket.TicketStatus.valueOf(newStatus.toUpperCase()); }
        catch (IllegalArgumentException e) { throw new IllegalArgumentException("Invalid status: " + newStatus); }

        ticket.setStatus(status);
        if (reason != null && !reason.isBlank()) ticket.setRejectionReason(reason);
        if (notes != null && !notes.isBlank()) ticket.setResolutionNotes(notes);

        Ticket saved = ticketRepository.save(ticket);

        // Notify creator
        if (!ticket.getCreatedBy().getId().equals(actor.getId())) {
            notificationService.send(
                ticket.getCreatedBy(),
                "Ticket Status Updated",
                "Your ticket \"" + ticket.getTitle() + "\" is now " + status.name(),
                Notification.NotificationType.TICKET_STATUS_CHANGED,
                ticket.getId()
            );
        }
        return saved;
    }

    public Ticket assign(Long ticketId, Long assigneeId, User actor) {
        Ticket ticket = getById(ticketId);
        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new RuntimeException("User not found: " + assigneeId));
        ticket.setAssignedTo(assignee);
        if (ticket.getStatus() == Ticket.TicketStatus.OPEN) {
            ticket.setStatus(Ticket.TicketStatus.IN_PROGRESS);
        }
        Ticket saved = ticketRepository.save(ticket);

        // Notify assignee
        if (!assignee.getId().equals(actor.getId())) {
            notificationService.send(
                assignee,
                "Ticket Assigned to You",
                "You have been assigned to ticket: \"" + ticket.getTitle() + "\"",
                Notification.NotificationType.TICKET_ASSIGNED,
                ticket.getId()
            );
        }
        return saved;
    }

    public void delete(Long id) {
        Ticket ticket = getById(id);
        ticket.getAttachments().forEach(fileStorageService::delete);
        ticketRepository.delete(ticket);
    }

    // ── Comments ──

    public List<TicketComment> getComments(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public TicketComment addComment(Long ticketId, String content, User author) {
        Ticket ticket = getById(ticketId);
        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .author(author)
                .content(content)
                .build();
        TicketComment saved = commentRepository.save(comment);

        // Notify ticket creator if someone else comments
        if (!ticket.getCreatedBy().getId().equals(author.getId())) {
            notificationService.send(
                ticket.getCreatedBy(),
                "New Comment on Your Ticket",
                author.getName() + " commented on \"" + ticket.getTitle() + "\"",
                Notification.NotificationType.NEW_COMMENT,
                ticket.getId()
            );
        }
        return saved;
    }

    public TicketComment editComment(Long commentId, String content, User editor) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getAuthor().getId().equals(editor.getId()))
            throw new SecurityException("You can only edit your own comments");
        comment.setContent(content);
        return commentRepository.save(comment);
    }

    public void deleteComment(Long commentId, User actor) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        boolean isOwner = comment.getAuthor().getId().equals(actor.getId());
        boolean isAdmin = actor.getRole() == User.Role.ADMIN;
        if (!isOwner && !isAdmin)
            throw new SecurityException("You cannot delete this comment");
        commentRepository.delete(comment);
    }
}
