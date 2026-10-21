
const EventEmitter = require("events");

const taskEventEmitter = new EventEmitter();

// Listen for task-created events
taskEventEmitter.on("task-created", (taskData) => {
  console.log("\n========== BACKGROUND NOTIFICATION ==========");
  console.log("Event          : task-created");
  console.log("Task Title     :", taskData.title);
  console.log("Assigned User  :", taskData.assignedUser);
  console.log("Task ID        :", taskData.taskId);
  console.log("Event Timestamp:", taskData.timestamp);
  console.log("Handler Time   :", new Date().toISOString());
  console.log("=============================================\n");
});

module.exports = taskEventEmitter;
