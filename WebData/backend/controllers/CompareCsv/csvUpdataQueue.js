const updateQueue = require("./queue"); // Import queue

const csvUpdateData = async (req, res) => {
  try {
    const { userName, email } = req.user;
    const { taskId } = req.params;
    const updates = req.body;

    if (!taskId || !updates || updates.length === 0) {
      return res.status(400).json({ message: "Invalid request" });
    }

    // Add job to queue
    const job = await updateQueue.add("updateTask", { taskId, updates, userEmail: email });

    return res.json({ message: "Task update queued", jobId: job.id });
  } catch (error) {
    console.error("Error adding job:", error);
    return res.status(500).json({ message: "Failed to queue update" });
  }
};
