package com.example.demo.repository;

import com.example.demo.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByStatus(Booking.BookingStatus status);

    long countByStatus(Booking.BookingStatus status);

    List<Booking> findByResourceId(Long resourceId);

    @Query("SELECT r.name, COUNT(b) FROM Booking b JOIN b.resource r GROUP BY r.id, r.name ORDER BY COUNT(b) DESC")
    List<Object[]> findTopResources();

    // Conflict check: any approved/pending booking for same resource on same date with overlapping time
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.date = :date " +
           "AND b.status IN ('PENDING', 'APPROVED') " +
           "AND b.startTime < :endTime " +
           "AND b.endTime > :startTime " +
           "AND (:excludeId IS NULL OR b.id <> :excludeId)")
    List<Booking> findConflicts(@Param("resourceId") Long resourceId,
                                @Param("date") LocalDate date,
                                @Param("startTime") LocalTime startTime,
                                @Param("endTime") LocalTime endTime,
                                @Param("excludeId") Long excludeId);
}
