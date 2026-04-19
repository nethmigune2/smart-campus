package com.example.demo.model;

import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    @Min(1)
    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private String location;

    @Column(name = "availability_start")
    private LocalTime availabilityStart;

    @Column(name = "availability_end")
    private LocalTime availabilityEnd;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "`status`", nullable = false)
    @Builder.Default
    private ResourceStatus status = ResourceStatus.AVAILABLE;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum ResourceType {
        AUDITORIUM, LAB, LECTURE_HALL, MEETING_ROOM
    }

    public enum ResourceStatus {
        AVAILABLE, MAINTENANCE, OCCUPIED
    }
}
