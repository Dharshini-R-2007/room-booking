package com.yourapp.classroombooking.exception;

public class ClassroomNotAvailableException extends RuntimeException {
    public ClassroomNotAvailableException(String message) {
        super(message);
    }
}
