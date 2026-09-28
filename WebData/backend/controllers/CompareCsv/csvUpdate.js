const csvQueue = require("../../services/csvQueue");

const csvUpdateData = async (req, res) => {
    try {
        const { taskId } = req.params;
        const updates = req.body;
        const user = req.user; // user info from authMiddleware

        await csvQueue.add("updateCSV", { taskId, updates, user }, { attempts: 5, backoff: 5000 });

        res.status(202).json({ message: "Update request added to queue" });
    } catch (error) {
        console.error("Error in csvUpdateData:", error);
        res.status(500).json({ message: "Failed to add update request to queue" });
    }
};

module.exports = csvUpdateData;
