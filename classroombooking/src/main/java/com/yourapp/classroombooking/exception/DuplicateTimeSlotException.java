package com.yourapp.classroombooking.exception;

public class DuplicateTimeSlotException extends RuntimeException {
    public DuplicateTimeSlotException(String message) {
        super(message);
    }
}
