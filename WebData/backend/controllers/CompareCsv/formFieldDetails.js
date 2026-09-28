const MappedData = require("../../models/TempleteModel/mappedData");
const TemplateData = require("../../models/TempleteModel/metadata");

exports.formFieldDetails = async (req, res) => {
  try {
    const { templateId, colName } = req.body;

    if (!templateId || !colName) {
      return res
        .status(400)
        .json({ message: "templateId and colName are required" });
    }

    // Fetch record matching templateId and colName
    const record = await MappedData.findOne({
      where: { templeteId:templateId, key:colName },
      attributes: ["value"], // Include templateId for next query
    });


    if (!record) {
      return res.status(404).json({ message: "No matching record found" });
    }

    // Fetch fieldType from TemplateData using templateId
    const templateData = await TemplateData.findOne({
      where: { attribute: record.value },
    //   attributes: ["fieldType"], // Get the required column
    });

    if (!templateData) {
      return res.status(404).json({ message: "No template data found" });
    }

    res.json({  templateData });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
