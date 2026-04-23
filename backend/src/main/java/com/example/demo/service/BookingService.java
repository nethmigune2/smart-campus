package com.example.demo.service;

import com.example.demo.model.Booking;
import com.example.demo.model.Notification;
import com.example.demo.model.Resource;
import com.example.demo.model.User;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.ResourceRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<Booking> getAll() {
        return bookingRepository.findAll();
    }

    public Booking getById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }

    public List<Booking> getByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public Booking create(Map<String, Object> body) {
        Long resourceId = Long.parseLong(body.get("resourceId").toString());
        Long userId = Long.parseLong(body.get("userId").toString());
        LocalDate date = LocalDate.parse(body.get("date").toString());
        LocalTime startTime = LocalTime.parse(body.get("startTime").toString());
        LocalTime endTime = LocalTime.parse(body.get("endTime").toString());

        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        if (resource.getStatus() == Resource.ResourceStatus.MAINTENANCE ||
                resource.getStatus() == Resource.ResourceStatus.OCCUPIED) {
            throw new IllegalStateException("Resource is currently unavailable");
        }

        List<Booking> conflicts = bookingRepository.findConflicts(resourceId, date, startTime, endTime, null);
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Time slot conflicts with an existing booking for this resource");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = Booking.builder()
                .resource(resource)
                .user(user)
                .date(date)
                .startTime(startTime)
                .endTime(endTime)
                .purpose(body.get("purpose").toString())
                .attendees(body.containsKey("attendees") ? Integer.parseInt(body.get("attendees").toString()) : null)
                .status(Booking.BookingStatus.PENDING)
                .build();

        return bookingRepository.save(booking);
    }

    public Booking approve(Long id) {
        Booking booking = getById(id);
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be approved");
        }
        booking.setStatus(Booking.BookingStatus.APPROVED);
        Booking saved = bookingRepository.save(booking);
        notificationService.send(
            booking.getUser(),
            "Booking Approved",
            "Your booking for \"" + booking.getResource().getName() + "\" on " + booking.getDate() + " has been approved.",
            Notification.NotificationType.BOOKING_APPROVED,
            booking.getId()
        );
        return saved;
    }

    public Booking reject(Long id, String reason) {
        Booking booking = getById(id);
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be rejected");
        }
        booking.setStatus(Booking.BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        Booking saved = bookingRepository.save(booking);
        notificationService.send(
            booking.getUser(),
            "Booking Rejected",
            "Your booking for \"" + booking.getResource().getName() + "\" on " + booking.getDate() + " was rejected. Reason: " + reason,
            Notification.NotificationType.BOOKING_REJECTED,
            booking.getId()
        );
        return saved;
    }

    public Booking cancel(Long id) {
        Booking booking = getById(id);
        if (booking.getStatus() != Booking.BookingStatus.APPROVED &&
                booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING or APPROVED bookings can be cancelled");
        }
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
