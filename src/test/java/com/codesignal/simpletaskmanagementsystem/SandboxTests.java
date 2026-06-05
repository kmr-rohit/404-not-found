package com.codesignal.simpletaskmanagementsystem;

import java.util.List;
import java.util.Optional;

public class SandboxTests {
    public static void main(String[] args) {
        testLevelOneSample();
        testPrioritySearch();
        testQuotaAndExpiration();
        testCompletionAndOverdueHistory();
        System.out.println("All sandbox tests passed.");
    }

    private static void testLevelOneSample() {
        SimpleTaskManagementSystem system = new SimpleTaskManagementSystemImpl();

        assertEquals("task_id_1", system.addTask(1, "Task A", 3));
        assertEquals("task_id_2", system.addTask(2, "Task B", 5));
        assertTrue(system.updateTask(3, "task_id_1", "Task A Updated", 6));
        assertEquals(Optional.of("{\"name\":\"Task A Updated\",\"priority\":6}"),
                system.getTask(4, "task_id_1"));
        assertTrue(system.getTask(5, "task_id_3").isEmpty());
        assertFalse(system.updateTask(6, "task_id_3", "Non-existing Task", 1));
    }

    private static void testPrioritySearch() {
        SimpleTaskManagementSystem system = new SimpleTaskManagementSystemImpl();

        system.addTask(1, "Task 1", 10);
        system.addTask(2, "Task 2", 20);
        system.addTask(3, "Task 3", 20);
        system.addTask(4, "Task 4", 5);

        assertEquals(List.of("task_id_3", "task_id_2", "task_id_1"), system.searchTasks(5, 10, 25));
    }

    private static void testQuotaAndExpiration() {
        SimpleTaskManagementSystem system = new SimpleTaskManagementSystemImpl();

        assertTrue(system.addUser(1, "user1", 1));
        assertTrue(system.assignTask("task1", "user1", 10, 5, 100));
        assertFalse(system.assignTask("task2", "user1", 20, 5, 102));
        assertTrue(system.assignTask("task2", "user1", 20, 5, 105));
    }

    private static void testCompletionAndOverdueHistory() {
        SimpleTaskManagementSystem system = new SimpleTaskManagementSystemImpl();

        assertTrue(system.addUser(1, "user2", 2));
        assertTrue(system.assignTask("task_A", "user2", 10, 10, 200));
        assertTrue(system.assignTask("task_B", "user2", 10, 10, 205));
        assertTrue(system.completeTask("task_A", 208));
        assertFalse(system.completeTask("task_B", 220));
        assertEquals(List.of("task_B"), system.getOverdueTasks());
    }

    private static void assertTrue(boolean value) {
        if (!value) {
            throw new AssertionError("Expected true");
        }
    }

    private static void assertFalse(boolean value) {
        if (value) {
            throw new AssertionError("Expected false");
        }
    }

    private static void assertEquals(Object expected, Object actual) {
        if (!expected.equals(actual)) {
            throw new AssertionError("Expected <" + expected + "> but got <" + actual + ">");
        }
    }
}
