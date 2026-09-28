const sequelize = require("../../utils/database"); // Import the Sequelize instance
const { QueryTypes } = require("sequelize");

exports.checkDuplicates = async (req, res) => {
  try {
    const { header, tableName } = req.body;

    // **Validate input to prevent SQL injection**
    if (!header || !tableName ) {
        return res.status(400).json({ error: "Invalid table name or column" });
      }
      

    // **SQL Query to find duplicates**
    const query = `
      SELECT \`${header}\`, COUNT(*) AS count
      FROM \`${tableName}\`
      GROUP BY \`${header}\`
      HAVING COUNT(*) > 1;
    `;  

    // **Execute the query using Sequelize**
    const duplicates = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({ duplicates });
  } catch (error) {
    console.error("Error checking duplicates:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
