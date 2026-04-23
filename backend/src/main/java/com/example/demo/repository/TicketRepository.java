package com.example.demo.repository;

import com.example.demo.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCreatedByIdOrderByCreatedAtDesc(Long userId);
    List<Ticket> findByAssignedToIdOrderByCreatedAtDesc(Long userId);
    List<Ticket> findByStatusOrderByCreatedAtDesc(Ticket.TicketStatus status);
    List<Ticket> findAllByOrderByCreatedAtDesc();
}
