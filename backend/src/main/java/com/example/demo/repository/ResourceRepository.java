package com.example.demo.repository;

import com.example.demo.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByType(Resource.ResourceType type);

    List<Resource> findByStatus(Resource.ResourceStatus status);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    @Query("SELECT r FROM Resource r WHERE " +
           "(:type IS NULL OR r.type = :type) AND " +
           "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minCapacity IS NULL OR r.capacity >= :minCapacity) AND " +
           "(:status IS NULL OR r.status = :status)")
    List<Resource> search(@Param("type") Resource.ResourceType type,
                          @Param("location") String location,
                          @Param("minCapacity") Integer minCapacity,
                          @Param("status") Resource.ResourceStatus status);
}
