package com.yourapp.classroombooking.exception;

public class TimeSlotInUseException extends RuntimeException {
    public TimeSlotInUseException(String message) {
        super(message);
    }
}
