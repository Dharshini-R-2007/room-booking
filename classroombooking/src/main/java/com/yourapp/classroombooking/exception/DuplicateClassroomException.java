package com.yourapp.classroombooking.exception;

public class DuplicateClassroomException extends RuntimeException {
    public DuplicateClassroomException(String message) {
        super(message);
    }
}
