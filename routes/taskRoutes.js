const express = require("express");
const router = express.Router();

const { verifyAccessToken } = require("../middleware/index.js");
const { getTasks, getTask, postTask, putTask, deleteTask, markTaskComplete } = require("../controllers/taskControllers.js");

// Routes beginning with /api/tasks
router.get("/", verifyAccessToken, getTasks);
router.get("/:taskId", verifyAccessToken, getTask);
router.post("/", verifyAccessToken, postTask);
router.put("/:taskId", verifyAccessToken, putTask);
router.delete("/:taskId", verifyAccessToken, deleteTask);
router.patch("/:taskId/complete", verifyAccessToken, markTaskComplete);

module.exports = router;
