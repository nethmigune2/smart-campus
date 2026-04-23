package com.example.demo.service;

import com.example.demo.model.Booking;
import com.example.demo.model.Ticket;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getSummary() {
        Map<String, Object> result = new LinkedHashMap<>();

        result.put("totalUsers",     userRepository.count());
        result.put("totalResources", resourceRepository.count());
        result.put("totalBookings",  bookingRepository.count());
        result.put("totalTickets",   ticketRepository.count());

        Map<String, Long> bookingsByStatus = new LinkedHashMap<>();
        for (Booking.BookingStatus s : Booking.BookingStatus.values()) {
            bookingsByStatus.put(s.name(), bookingRepository.countByStatus(s));
        }
        result.put("bookingsByStatus", bookingsByStatus);

        Map<String, Long> ticketsByStatus = new LinkedHashMap<>();
        for (Ticket.TicketStatus s : Ticket.TicketStatus.values()) {
            ticketsByStatus.put(s.name(), ticketRepository.countByStatus(s));
        }
        result.put("ticketsByStatus", ticketsByStatus);

        Map<String, Long> ticketsByCategory = new LinkedHashMap<>();
        for (Ticket.TicketCategory c : Ticket.TicketCategory.values()) {
            long count = ticketRepository.countByCategory(c);
            if (count > 0) ticketsByCategory.put(c.name(), count);
        }
        result.put("ticketsByCategory", ticketsByCategory);

        List<Map<String, Object>> topResources = new ArrayList<>();
        for (Object[] row : bookingRepository.findTopResources()) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("name",  row[0]);
            entry.put("count", row[1]);
            topResources.add(entry);
            if (topResources.size() == 5) break;
        }
        result.put("topResources", topResources);

        return result;
    }
}
