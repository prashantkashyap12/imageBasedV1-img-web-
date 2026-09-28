const Assigndata = require("../../models/TempleteModel/assigndata");

const updateCurrentIndex = async (req, res) => {
  try {
    const { taskId, direction } = req.body;

    if (!["next", "prev"].includes(direction)) {
      return res.status(400).json({ error: "Invalid direction" });
    }

    const assignData = await Assigndata.findByPk(taskId);

    if (!assignData) {
      return res.status(404).json({ error: "Task not found" });
    }

    let { min, max, currentIndex } = assignData;

    // Ensure min, max, and currentIndex are numbers
    min = Number(min);
    max = Number(max);
    currentIndex = Number(currentIndex) || min;

    if (direction === "next") {
      if (currentIndex >= max) {
        return res.status(409).json({ message: "Last data reached" });
      }
      currentIndex++;
    } else if (direction === "prev") {
      if (currentIndex <= min) {
        return res.status(409).json({ message: "Initial data reached" });
      }
      currentIndex--;
    }

    assignData.currentIndex = currentIndex;
    await assignData.save();

    return res.status(200).json({
      message: "Index updated successfully",
      updatedIndex: currentIndex,
    });
  } catch (error) {
    console.error("Error updating index:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = updateCurrentIndex;
