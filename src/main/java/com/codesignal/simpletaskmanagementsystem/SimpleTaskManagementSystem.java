package com.codesignal.simpletaskmanagementsystem;

import java.util.List;
import java.util.Optional;

/**
 * Interface for the SimpleTaskManagementSystem challenge.
 *
 * The first three methods match the Level 1 signatures visible in the prompt.
 * Later-level methods are included so the solution can be compiled and tested
 * outside the CodeSignal harness.
 */
public interface SimpleTaskManagementSystem {
    default String addTask(int timestamp, String name, int priority) {
        return "";
    }

    default boolean updateTask(int timestamp, String taskId, String name, int priority) {
        return false;
    }

    default Optional<String> getTask(int timestamp, String taskId) {
        return Optional.empty();
    }

    default List<String> searchTasks(int timestamp, int minPriority, int maxPriority) {
        return List.of();
    }

    default boolean addUser(int timestamp, String userId, int quota) {
        return false;
    }

    default boolean updateUserQuota(int timestamp, String userId, int quota) {
        return false;
    }

    default boolean setUserQuota(int timestamp, String userId, int quota) {
        return updateUserQuota(timestamp, userId, quota);
    }

    default boolean assignTask(int timestamp, String taskId, String userId, int ttl) {
        return false;
    }

    default boolean assignTask(String taskId, String userId, int priority, int ttl, int timestamp) {
        return false;
    }

    default boolean completeTask(int timestamp, String taskId) {
        return false;
    }

    default boolean completeTask(String taskId, int finishTime) {
        return completeTask(finishTime, taskId);
    }

    default List<String> getUserTasks(int timestamp, String userId) {
        return List.of();
    }

    default List<String> getOverdueTasks(int timestamp) {
        return List.of();
    }

    default List<String> getOverdueTasks() {
        return List.of();
    }
}
