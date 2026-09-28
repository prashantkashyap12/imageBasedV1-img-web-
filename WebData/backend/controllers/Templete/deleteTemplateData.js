const MetaData = require("../../models/TempleteModel/metadata");

const deleteTemplateData = async(req,res)=>{
const id = req.params.id

const deleted = await MetaData.destroy({ where: { id: id } });

// console.log(deleted)
res.json({status:deleted})
}

module.exports =deleteTemplateData