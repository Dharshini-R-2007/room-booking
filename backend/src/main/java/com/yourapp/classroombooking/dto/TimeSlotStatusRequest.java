package com.yourapp.classroombooking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeSlotStatusRequest {

    @NotNull(message = "Active status is required")
    private Boolean active;
}
