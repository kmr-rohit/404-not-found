package com.codesignal.simpletaskmanagementsystem;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

class SimpleTaskManagementSystemImpl implements SimpleTaskManagementSystem {
    private final Map<String, Task> tasks = new LinkedHashMap<>();
    private final Map<String, User> users = new LinkedHashMap<>();
    private final Set<String> overdueTaskIds = new LinkedHashSet<>();
    private int nextTaskNumber = 1;
    private long nextCreationOrder = 1;

    public SimpleTaskManagementSystemImpl() {
        // Empty constructor required by the challenge harness.
    }

    @Override
    public String addTask(int timestamp, String name, int priority) {
        expireTasks(timestamp);

        String taskId = "task_id_" + nextTaskNumber++;
        tasks.put(taskId, new Task(taskId, name, priority, nextCreationOrder++));
        return taskId;
    }

    @Override
    public boolean updateTask(int timestamp, String taskId, String name, int priority) {
        expireTasks(timestamp);

        Task task = tasks.get(taskId);
        if (task == null || !task.isVisible()) {
            return false;
        }

        task.name = name;
        task.priority = priority;
        return true;
    }

    @Override
    public Optional<String> getTask(int timestamp, String taskId) {
        expireTasks(timestamp);

        Task task = tasks.get(taskId);
        if (task == null || !task.isVisible()) {
            return Optional.empty();
        }

        return Optional.of(toTaskJson(task));
    }

    @Override
    public List<String> searchTasks(int timestamp, int minPriority, int maxPriority) {
        expireTasks(timestamp);

        List<Task> matches = new ArrayList<>();
        for (Task task : tasks.values()) {
            if (task.isVisible() && minPriority <= task.priority && task.priority <= maxPriority) {
                matches.add(task);
            }
        }

        matches.sort(taskPriorityComparator());
        return taskIds(matches);
    }

    public List<String> searchTasks(int minPriority, int maxPriority) {
        return searchTasks(Integer.MAX_VALUE, minPriority, maxPriority);
    }

    public List<String> findTasks(int timestamp, int minPriority, int maxPriority) {
        return searchTasks(timestamp, minPriority, maxPriority);
    }

    public List<String> getTasksByPriority(int timestamp, int minPriority, int maxPriority) {
        return searchTasks(timestamp, minPriority, maxPriority);
    }

    @Override
    public boolean addUser(int timestamp, String userId, int quota) {
        expireTasks(timestamp);

        if (users.containsKey(userId)) {
            return false;
        }

        users.put(userId, new User(userId, quota));
        return true;
    }

    public boolean addUser(String userId, int quota) {
        if (users.containsKey(userId)) {
            return false;
        }

        users.put(userId, new User(userId, quota));
        return true;
    }

    @Override
    public boolean updateUserQuota(int timestamp, String userId, int quota) {
        expireTasks(timestamp);

        User user = users.get(userId);
        if (user == null || quota < user.activeTaskCount) {
            return false;
        }

        user.quota = quota;
        return true;
    }

    @Override
    public boolean setUserQuota(int timestamp, String userId, int quota) {
        return updateUserQuota(timestamp, userId, quota);
    }

    public boolean updateQuota(int timestamp, String userId, int quota) {
        return updateUserQuota(timestamp, userId, quota);
    }

    @Override
    public boolean assignTask(int timestamp, String taskId, String userId, int ttl) {
        expireTasks(timestamp);

        User user = users.get(userId);
        Task task = tasks.get(taskId);
        if (user == null || task == null || !task.isVisible() || task.isActivelyAssigned()
                || user.activeTaskCount >= user.quota) {
            return false;
        }

        assignExistingTask(task, user, timestamp, ttl);
        return true;
    }

    @Override
    public boolean assignTask(String taskId, String userId, int priority, int ttl, int timestamp) {
        expireTasks(timestamp);

        User user = users.get(userId);
        Task existing = tasks.get(taskId);
        if (user == null || (existing != null && !existing.isExpired()) || user.activeTaskCount >= user.quota) {
            return false;
        }

        Task task = new Task(taskId, taskId, priority, nextCreationOrder++);
        tasks.put(taskId, task);
        assignExistingTask(task, user, timestamp, ttl);
        return true;
    }

    public boolean assignTask(int timestamp, String taskId, String userId, int priority, int ttl) {
        return assignTask(taskId, userId, priority, ttl, timestamp);
    }

    @Override
    public boolean completeTask(int timestamp, String taskId) {
        expireTasks(timestamp);

        Task task = tasks.get(taskId);
        if (task == null || task.completed || task.isExpired() || task.expirationTime == null
                || timestamp >= task.expirationTime) {
            expireTask(task);
            return false;
        }

        task.completed = true;
        User user = users.get(task.assignedUserId);
        if (user != null && user.activeTaskCount > 0) {
            user.activeTaskCount--;
        }
        return true;
    }

    @Override
    public boolean completeTask(String taskId, int finishTime) {
        return completeTask(finishTime, taskId);
    }

    @Override
    public List<String> getUserTasks(int timestamp, String userId) {
        expireTasks(timestamp);

        if (!users.containsKey(userId)) {
            return List.of();
        }

        List<Task> matches = new ArrayList<>();
        for (Task task : tasks.values()) {
            if (task.isActivelyAssigned() && userId.equals(task.assignedUserId)) {
                matches.add(task);
            }
        }

        matches.sort(taskPriorityComparator());
        return taskIds(matches);
    }

    public List<String> getUserTasks(String userId, int timestamp) {
        return getUserTasks(timestamp, userId);
    }

    @Override
    public List<String> getOverdueTasks(int timestamp) {
        expireTasks(timestamp);
        return new ArrayList<>(overdueTaskIds);
    }

    @Override
    public List<String> getOverdueTasks() {
        return new ArrayList<>(overdueTaskIds);
    }

    private void assignExistingTask(Task task, User user, int timestamp, int ttl) {
        task.assignedUserId = user.id;
        task.assignedAt = timestamp;
        task.expirationTime = timestamp + ttl;
        task.expired = false;
        task.completed = false;
        user.activeTaskCount++;
    }

    private void expireTasks(int timestamp) {
        for (Task task : tasks.values()) {
            if (task.isActivelyAssigned() && task.expirationTime <= timestamp) {
                expireTask(task);
            }
        }
    }

    private void expireTask(Task task) {
        if (task == null || task.expired || task.completed) {
            return;
        }

        task.expired = true;
        User user = users.get(task.assignedUserId);
        if (user != null && user.activeTaskCount > 0) {
            user.activeTaskCount--;
        }
        if (task.assignedUserId != null) {
            overdueTaskIds.add(task.id);
        }
    }

    private static Comparator<Task> taskPriorityComparator() {
        return Comparator.comparingInt((Task task) -> task.priority)
                .reversed()
                .thenComparing(Comparator.comparingLong((Task task) -> task.creationOrder).reversed());
    }

    private static List<String> taskIds(List<Task> tasks) {
        List<String> ids = new ArrayList<>();
        for (Task task : tasks) {
            ids.add(task.id);
        }
        return ids;
    }

    private static String toTaskJson(Task task) {
        return "{\"name\":\"" + escapeJson(task.name) + "\",\"priority\":" + task.priority + "}";
    }

    private static String escapeJson(String value) {
        StringBuilder escaped = new StringBuilder();
        for (int i = 0; i < value.length(); i++) {
            char ch = value.charAt(i);
            switch (ch) {
                case '\\':
                    escaped.append("\\\\");
                    break;
                case '"':
                    escaped.append("\\\"");
                    break;
                case '\b':
                    escaped.append("\\b");
                    break;
                case '\f':
                    escaped.append("\\f");
                    break;
                case '\n':
                    escaped.append("\\n");
                    break;
                case '\r':
                    escaped.append("\\r");
                    break;
                case '\t':
                    escaped.append("\\t");
                    break;
                default:
                    if (ch < 0x20) {
                        escaped.append(String.format("\\u%04x", (int) ch));
                    } else {
                        escaped.append(ch);
                    }
                    break;
            }
        }
        return escaped.toString();
    }

    private static final class Task {
        private final String id;
        private final long creationOrder;
        private String name;
        private int priority;
        private String assignedUserId;
        private Integer assignedAt;
        private Integer expirationTime;
        private boolean completed;
        private boolean expired;

        private Task(String id, String name, int priority, long creationOrder) {
            this.id = id;
            this.name = name;
            this.priority = priority;
            this.creationOrder = creationOrder;
        }

        private boolean isVisible() {
            return !completed && !expired;
        }

        private boolean isExpired() {
            return expired;
        }

        private boolean isActivelyAssigned() {
            return assignedUserId != null && expirationTime != null && !completed && !expired;
        }
    }

    private static final class User {
        private final String id;
        private int quota;
        private int activeTaskCount;

        private User(String id, int quota) {
            this.id = id;
            this.quota = quota;
        }
    }
}
