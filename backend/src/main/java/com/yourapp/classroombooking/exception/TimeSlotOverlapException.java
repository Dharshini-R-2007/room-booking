package com.yourapp.classroombooking.exception;

public class TimeSlotOverlapException extends RuntimeException {
    public TimeSlotOverlapException(String message) {
        super(message);
    }
}
