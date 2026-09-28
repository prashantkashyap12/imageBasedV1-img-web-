// controllers/Templete/templateDataPatch.js
const path = require("path");
const MetaData = require("../../models/TempleteModel/metadata.js");
// console.log(MetaData);
// PATCH /api/attributes/batch
// body: { updates: [{ id, pattern?, blank?, empty? }, ...] }
const templateDataPatch = async (req, res) => {
  const { updates } = req.body;
  // console.log(updates)
  // ---- Input validation ----
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({
      error: "'updates' must be a non-empty array.",
    });
  }

  // ---- Safety guard ----
  //   if (!MetaData) {
  //     return res.status(500).json({ error: "MetaData model not loaded." });
  //   }

  try {
    // Run all updates in parallel (fast)
    const results = await Promise.all(
      updates.map(async (data) => {
        const { id, pattern, blank, empty } = data;

        if (!id) {
          throw new Error(
            `Missing 'id' in update object: ${JSON.stringify(data)}`
          );
        }

        // Only update fields that are provided
        const updateFields = {};
        if (pattern !== undefined) updateFields.pattern = pattern  
        if(pattern===null) updateFields.pattern = false;
        if (blank !== undefined) updateFields.blank = blank;
        if(blank===null) updateFields.blank = false;
        if (empty !== undefined) updateFields.empty = empty;
        if(empty===null) updateFields.empty = false;
        // console.log(updateFields);
        // Skip if nothing to update
        if (Object.keys(updateFields).length === 0) {
          return { id, skipped: true, reason: "no fields to update" };
        }

        const [affectedRows] = await MetaData.update(updateFields, {
          where: { id },
        });

        if (affectedRows === 0) {
          throw new Error(`No record found with id: ${id}`);
        }

        return { id, success: true };
      })
    );

    // Count successes
    const successCount = results.filter((r) => r.success).length;
    const skippedCount = results.filter((r) => r.skipped).length;

    return res.status(200).json({
      message: "Batch update completed",
      updatedCount: successCount,
      skippedCount,
      total: updates.length,
      // results, // Uncomment to return full details
    });
  } catch (error) {
    console.error("Batch update failed:", error.message);
    return res.status(500).json({
      error: "Batch update failed",
      details: error.message,
    });
  }
};

module.exports = templateDataPatch;
