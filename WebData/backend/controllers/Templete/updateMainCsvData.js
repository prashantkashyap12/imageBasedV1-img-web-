const Template = require("../../models/TempleteModel/templete");
const Assigndata = require("../../models/TempleteModel/assigndata");
const sequelize = require("../../utils/database");

function validateUpdatedData(joinedData = [], updatedData = {}) {
  const errors = [];

  // Build lookup map by attribute and key (case-insensitive)
  const permMap = {};
  joinedData.forEach((row) => {
    if (!row) return;
    if (row.attribute) permMap[row.attribute.toString().toUpperCase()] = row;
    if (row.key) permMap[row.key.toString().toUpperCase()] = row;
  });

  const isEffectivelyEmpty = (val) => {
    if (val === null || val === undefined) return true;
    return String(val).trim() === "";
  };

  const blankDefToTest = (blankDef) => {
    if (blankDef === null || blankDef === undefined) return null;
    const d = String(blankDef).trim().toLowerCase();
    // if (d === "") return null;
    if (d === "space") return " ";
    // if (d === "tab") return "\t";
    // if (d === "newline" || d === "nl" || d === "line") return "\n";
    return String(blankDef);
  };

  const ciContains = (value, sub) => {
    if (value === null || value === undefined) return false;
    if (sub === null || sub === undefined) return false;
    return String(value).toLowerCase().includes(String(sub).toLowerCase());
  };

  Object.keys(updatedData).forEach((rawKey) => {
    const key = rawKey.toString().toUpperCase();
    const row = permMap[key];
    if (!row) return;

    if (row.fieldType && row.fieldType.toLowerCase() !== "formfield") return;

    const value = updatedData[rawKey];
    const strVal = String(value);

    // Bits
    const emptyBit = Boolean(Number(row.empty));
    const blankBit = Boolean(Number(row.blank));
    const patternBit = Boolean(Number(row.pattern));

    // -------------------------
    // 1) EMPTY CHECK
    // -------------------------
    if (!emptyBit && isEffectivelyEmpty(value)) {
      errors.push({
        key: rawKey,
        message: `Field "${rawKey}" is not allowed to be empty.`,
        reason: "empty",
      });
    }

    // -------------------------
    // 2) BLANK CHECK
    // -------------------------
    const blankRaw =
      row.blankDefinition ?? row.blankDefination ?? row.blankDef ?? null;
    const blankDef = blankDefToTest(blankRaw);

    if (!blankBit && blankDef !== null && ciContains(value, blankDef)) {
      errors.push({
        key: rawKey,
        message: `Field "${rawKey}" contains disallowed blank token (${String(
          blankRaw,
        )}).`,
        reason: "blank",
        blankDefinition: blankRaw,
      });
    }

    // -------------------------
    // 3) PATTERN CHECK
    // -------------------------
    const patRaw =
      row.patternDefinition ?? row.patternDef ?? row.pattern ?? null;

    if (!patternBit && patRaw !== null && String(patRaw).trim() !== "") {
      if (ciContains(value, patRaw)) {
        errors.push({
          key: rawKey,
          message: `Field "${rawKey}" contains disallowed patternDefinition (${String(
            patRaw,
          )}).`,
          reason: "pattern",
          patternDefinition: patRaw,
        });
      }
    }

    // --------------------------------------------------------
    // 4) FIELD LENGTH VALIDATION
    // --------------------------------------------------------
    const maxLen = row.fieldLength ? Number(row.fieldLength) : null;
    if (maxLen && strVal.length > maxLen) {
      errors.push({
        key: rawKey,
        message: `Field "${rawKey}" exceeds maximum length of ${maxLen}.`,
        reason: "length",
      });
    }

    // --------------------------------------------------------
    // 5) DATA FIELD TYPE VALIDATION (NOW ALLOW PATTERN + BLANK)
    // --------------------------------------------------------
    if (row.dataFieldType) {
      const type = row.dataFieldType.toLowerCase();

      let cleaned = strVal;

      // keep allowed pattern chars
      if (patternBit && patRaw != null) {
        cleaned = cleaned.split(String(patRaw)).join("");
      }

      // keep allowed blank chars
      if (blankBit && blankDef != null) {
        cleaned = cleaned.split(String(blankDef)).join("");
      }

      if (type === "number" && !/^[0-9]*$/.test(cleaned)) {
        errors.push({
          key: rawKey,
          message: `Field "${rawKey}" must contain only numbers (allowed pattern/blank excluded).`,
          reason: "dataFieldType",
        });
      }

      if (type === "text" && !/^[a-zA-Z ]*$/.test(cleaned)) {
        errors.push({
          key: rawKey,
          message: `Field "${rawKey}" must contain only alphabetic characters (allowed pattern/blank excluded).`,
          reason: "dataFieldType",
        });
      }

      if (type === "alphanumeric" && !/^[a-zA-Z0-9]*$/.test(cleaned)) {
        errors.push({
          key: rawKey,
          message: `Field "${rawKey}" must contain only alphanumeric characters (allowed pattern/blank excluded).`,
          reason: "dataFieldType",
        });
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

const updateMainCsvData = async (req, res) => {
  try {
    const { templateId, parentId, updatedData, editedData, taskId, userEmail } = req.body;
    // console.log(req.user.email)
    // console.log(parentId)
    // console.log(editedData)

//     const joinedData = await sequelize.query(
//       `SELECT 
//     m.id AS mappedId,
//     m.key,
//     m.value,
//     m.templeteId,

//     -- templetedata table
//     t.id AS templetedataId,
//     t.attribute,
//     t.pattern,
//     t.blank,
//     t.empty,
//     t.fieldType,
//     t.dataFieldType,
//     t.fieldRange,
//     t.fieldLength,

//     -- templete table (only these two columns)
//     tp.patternDefinition,
//     tp.blankDefination

// FROM mappeddata AS m
// LEFT JOIN templetedata AS t
//     ON m.templeteId = t.templeteId
//     AND m.value = t.attribute
//     AND t.fieldType = 'formField'

// LEFT JOIN templetes AS tp       -- <-- added 3rd table
//     ON m.templeteId = tp.id

// WHERE 
//     m.templeteId = ${templateId}
//     AND t.fieldType = 'formField';`,
//       {
//         type: sequelize.QueryTypes.SELECT,
//       },
//     );
const joinedData = await sequelize.query(
  `SELECT 
    m.id AS mappedId,
    m.key,
    m.value,
    m.templeteId,

    t.id AS templetedataId,
    t.attribute,
    t.pattern,
    t.blank,
    t.empty,
    t.fieldType,
    t.dataFieldType,
    t.fieldRange,
    t.fieldLength,

    tp.patternDefinition,
    tp.blankDefination

  FROM mappeddata AS m
  LEFT JOIN templetedata AS t
    ON m.templeteId = t.templeteId
    AND m.value = t.attribute
    AND t.fieldType = 'formField'

  LEFT JOIN templetes AS tp
    ON m.templeteId = tp.id

  WHERE 
    m.templeteId = :templateId
    AND t.fieldType = 'formField';
  `,
  {
    replacements: { templateId },
    type: sequelize.QueryTypes.SELECT,
  }
);

    // console.log(joinedData);
    // console.log(updatedData);

    const results = validateUpdatedData(joinedData, updatedData);
    // console.log(results);

    if (!results.valid) {
      // Use a network-style response (status + message + errors)
      return res.status(400).json({
        valid: false,
        status: results.status ?? "ERROR", // if your validator returns status, keep it; fallback to ERROR
        errors: results.errors || [],
        message: "Validation failed",
      });
    }

    // Fetch the template and get the table name
    const template = await Template.findByPk(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    const assignedTask = await Assigndata.findByPk(taskId);
    // console.log(assignedTask)
    const { tableName } = assignedTask;
    const result = Object.assign({}, ...editedData);

    // Step 1: Fetch existing Corrected data
    const [existingData] = await sequelize.query(
      `SELECT Corrected FROM ${tableName} WHERE parentId = :parentId`,
      {
        replacements: { parentId },
        type: sequelize.QueryTypes.SELECT,
      },
    );
    // console.log(existingData)
    // Step 2: Parse existing data (handle null case)
    let correctedData = {};
    if (existingData?.Corrected) {
      try {
        correctedData = JSON.parse(existingData.Corrected);
      } catch (error) {
        console.error("Error parsing existing Corrected data:", error);
      }
    }

    // Step 3: Merge new data (existing values are updated, new ones added)
    const updatedCorrected = { ...correctedData, ...result };

    // Step 4: Update the database with merged data
   const query1 = `
  UPDATE ${tableName}
  SET Corrected_By = :userEmail, Corrected = :updatedData
  WHERE parentId = :parentId
`;

await sequelize.query(query1, {
  replacements: {
    userEmail, // ✅ FIXED
    parentId,
    updatedData: JSON.stringify(updatedCorrected),
  },
  type: sequelize.QueryTypes.UPDATE,
});
    const csvTableName = template.csvTableName;

    // Build the query dynamically based on updatedData
    const setValues = Object.entries(updatedData)
      .map(([key, value]) => `\`${key}\` = :${key}`) // Named parameters for safety
      .join(", ");

    const query = `
            UPDATE ${csvTableName}
            SET ${setValues}
            WHERE id = :parentId
        `;

    // Execute query with parameters
    await sequelize.query(query, {
      replacements: { ...updatedData, parentId },
      type: sequelize.QueryTypes.UPDATE,
    });

    res.status(200).json({
      message: "Data updated successfully", // if your validator returns status, keep it; fallback to ERROR
    });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ message: "Failed to update data", error });
  }
};

module.exports = updateMainCsvData;
