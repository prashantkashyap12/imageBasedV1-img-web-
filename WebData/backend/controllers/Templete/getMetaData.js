const MappedData = require("../../models/TempleteModel/mappedData");
const MetaData = require("../../models/TempleteModel/metadata");
// const getMetaData = async (req, res) => {
//   try {
//     const { columnName, templateId } = req.query;
//     const metaData = await MetaData.findAll({ templeteId: templateId });
//     const mappedData = await MappedData.findAll({
//       where: { templeteId: templateId },
//       attributes: ["key", "value"],
//     });

//     let currentMeta = [];
//     for (let i = 0; i < mappedData.length; i++) {
//       for (let j = 0; j < metaData.length; j++) {
//         if (mappedData[i].key === columnName) {
//           if (metaData[j].attribute===mappedData[i].value) {
//             currentMeta.push(metaData[j]);
//           }
//         }
//       }
//     }

//     return res.status(200).json({ success: true, data: currentMeta });
//   } catch (error) {
//     console.log(error);

//   }
// };
const getMetaData = async (req, res) => {
  try {
    const { columnName, templateId } = req.query;

    // Fetch data concurrently for better performance
    const [metaData, mappedData] = await Promise.all([
      MetaData.findAll({where: { templeteId: templateId }, }),
      MappedData.findAll({
        where: { templeteId: templateId }, // Fixed typo from `templeteId` to `templateId`
        attributes: ["key", "value"],
      }),
    ]);

    // Filter mapped data that matches the columnName
    const filteredValues = mappedData
      .filter((data) => data.key === columnName)
      .map((data) => data.value);

    // Filter metaData that matches the filtered values
    const currentMeta = metaData.filter((meta) =>
      filteredValues.includes(meta.attribute)
    );

    return res.status(200).json({ success: true, data: currentMeta });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = getMetaData;
