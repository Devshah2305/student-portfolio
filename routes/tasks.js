
const express = require("express");
const NodeCache = require("node-cache");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/auth");
const { validateTask } = require("../middleware/validate");
const taskEventEmitter = require("../events/taskEvents");

const router = express.Router();

// Cache entries expire after 60 seconds
const taskCache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
});

// Each user gets a separate cache entry
const getCacheKey = (userId) => `tasks:${userId}`;

// Measure server-side response time
function setResponseTime(res, startTime) {
  const elapsedMs =
    Number(process.hrtime.bigint() - startTime) / 1e6;

  res.set("X-Response-Time", `${elapsedMs.toFixed(2)}ms`);
}

// Protect all task routes
router.use(authMiddleware);

// ── GET /tasks — CACHED ──────────────────────────────────────
router.get("/", async (req, res) => {
  const startTime = process.hrtime.bigint();
  const cacheKey = getCacheKey(req.user.id);

  try {
    // Check whether this user's tasks are cached
    const cachedResponse = taskCache.get(cacheKey);

    if (cachedResponse !== undefined) {
      res.set("X-Cache", "HIT");
      setResponseTime(res, startTime);

      return res.status(200).json(cachedResponse);
    }

    // Cache miss: retrieve tasks from MongoDB
    const tasks = await Task.find({
      owner: req.user.id,
    }).sort({ createdAt: -1 });

    const response = {
      success: true,
      data: tasks,
    };

    // Store the response for 60 seconds
    taskCache.set(cacheKey, response);

    res.set("X-Cache", "MISS");
    setResponseTime(res, startTime);

    return res.status(200).json(response);
  } catch (err) {
    console.error("GET /tasks error:", err.message);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ── POST /tasks — CREATE ─────────────────────────────────────

router.post("/", validateTask, async (req, res) => {
  const requestStart = new Date().toISOString();

  try {
    const { title, description } = req.body;

    // 1. Save the task to MongoDB first
    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      completed: false,
      owner: req.user.id,
    });

    console.log("\n[API] Task saved at:", new Date().toISOString());

    // 2. Invalidate cached task list
    taskCache.del(getCacheKey(req.user.id));

    // Prepare notification data
    const notificationData = {
      taskId: task._id.toString(),
      title: task.title,
      assignedUser: req.user.username || req.user.id,
      timestamp: new Date().toISOString(),
    };

    // 3. Respond to the client immediately
    res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: task,
      requestStart,
      responseTime: new Date().toISOString(),
    });

    // 4. Emit the event asynchronously after initiating the response
    setImmediate(() => {
      taskEventEmitter.emit("task-created", notificationData);
    });

  } catch (err) {
    console.error("POST /tasks error:", err.message);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
});


// ── PUT /tasks/:id — UPDATE ──────────────────────────────────
router.put("/:id", validateTask, async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id,
      },
      {
        title: title.trim(),
        description: description ? description.trim() : "",
        completed,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // Invalidate the cache after successful update
    taskCache.del(getCacheKey(req.user.id));

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (err) {
    console.error("PUT /tasks/:id error:", err.message);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ── DELETE /tasks/:id — DELETE ───────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // Invalidate the cache after successful deletion
    taskCache.del(getCacheKey(req.user.id));

    return res.status(200).json({
      success: true,
      message: "Task deleted.",
    });
  } catch (err) {
    console.error("DELETE /tasks/:id error:", err.message);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
