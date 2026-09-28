const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { execSync } = require("child_process");
const fs = require("fs");
const sequelize = require("./utils/database");
const bodyParser = require("body-parser");
const templeteRoutes = require("./routes/templete");
const userRoutes = require("./routes/userManagement");
const compareCsv = require("./routes/compareCsv");
const mergeCsv = require("./routes/merge");
const Templete = require("./models/TempleteModel/templete");
// const MappedData = require("./models/TempleteModel/mappedData")
const User = require("./models/User");
const MetaData = require("./models/TempleteModel/metadata");
const Files = require("./models/TempleteModel/files");
const UpdatedData = require("./models/TempleteModel/updatedData");
const Settings = require("./routes/settings");
const ErrorTable = require("./models/CompareModel/ErrrorTable");
const ErrorAggregatedTable = require("./models/CompareModel/ErrorAggregatedTable");
// require("./services/csvWorker");

const upload = require("./routes/upload");
const path = require("path");
const bcrypt = require("bcryptjs");
const Assigndata = require("./models/TempleteModel/assigndata");
const RowIndexData = require("./models/TempleteModel/rowIndexData");
const ImageDataPath = require("./models/TempleteModel/templeteImages");
const MappedData = require("./models/TempleteModel/mappedData");
const createDatabaseIfNotExists = require("./utils/createDb");
const builtPath = path.join(
  __dirname,
  "../../OMR/build"
);
const buildBat = path.join(__dirname, "../../OMR/build");
const { swaggerUi, swaggerSpec } = require("./swagger");


//middlewares
app.use(
  cors({
    origin: "*", // or specific domain
    exposedHeaders: ["X-Incomplete-Tasks", "X-Incomplete-Count","Content-Disposition"],
  })
);
app.use(express.json());
app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));

const imageDirectoryPath = path.join(
  __dirname,
  "../",
  "COMPARECSV_FILES",
  "OmrImages",
  "Images_2024-05-04T04-38-30-972Z/005.jpg"
);
// Serve static files from the 'extractedFiles' directory
// app.use("GetImage/?imagePath=", express.static(path.join(__dirname, "testFile")));
// app.use("/images", express.static(imageDirectoryPath));
// app.use("/images", express.static(path.join(__dirname, "extractedFiles")));

// const extractedFilesPath = path.join(__dirname, "extractedFiles");
// app.use("/images", (req, res, next) => {
//   const fs = require("fs");
//   const dirs = fs.readdirSync(extractedFilesPath);
//   for (const dir of dirs) {
//     const fullPath = path.join(extractedFilesPath, dir, req.path);
//     if (fs.existsSync(fullPath)) {
//       return res.sendFile(fullPath);
//     }
//   }
//   next();
// });

const extractedFilesPath = path.join(__dirname, "extractedFiles");

app.get("/images/*", (req, res) => {
  const imagePath = req.params[0];
  const fullPath = path.join(extractedFilesPath, imagePath);

  // 1. Try exact match first
  if (fs.existsSync(fullPath)) {
    return res.sendFile(fullPath);
  }

  // 2. Strip extra (n)(n)... suffixes from filename and retry
  const dir = path.dirname(fullPath);
  const ext = path.extname(fullPath);
  const base = path.basename(fullPath, ext);

  // Remove trailing (n)(n)(n)... pattern — e.g. (2)(3)(1) → ""
  const cleanBase = base.replace(/(\(\d+\))+$/, "");
  const cleanPath = path.join(dir, cleanBase + ext);

  if (fs.existsSync(cleanPath)) {
    return res.sendFile(cleanPath);
  }

  res.status(404).send("Image not found");
});



app.use(express.static(builtPath));

app.use("/users", userRoutes);
app.use(upload);
app.use(compareCsv);
app.use(templeteRoutes);
app.use(mergeCsv);
app.use("/settings", Settings);
app.get("/GetImage", (req, res) => {
  const imagePath = req.query.imagePath; // Get image path from query
  if (!imagePath) {
    return res.status(400).send("Image path is required.");
  }

  const filePath = path.join(__dirname, "testFile", imagePath); // Serve from 'testFile' directory
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("Image not found.");
    }
  });
});

// Swagger docs route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Handle all other routes and serve 'index.html'
app.get("*", (req, res) => {
  res.sendFile(path.join(builtPath, "index.html"));
});

// Define associations with cascading deletes
Templete.hasMany(MetaData, {
  foreignKey: {
    name: "templeteId",
    allowNull: false,
  },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

MetaData.belongsTo(Templete, {
  foreignKey: {
    name: "templeteId",
    allowNull: false,
  },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Templete.hasMany(Files, {
  foreignKey: {
    allowNull: false,
  },
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

Files.belongsTo(Templete, {
  foreignKey: {
    allowNull: false,
  },
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

Assigndata.hasMany(RowIndexData, {
  foreignKey: {
    allowNull: false,
  },
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

RowIndexData.belongsTo(Assigndata, {
  foreignKey: {
    allowNull: false,
  },
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

Templete.hasMany(ImageDataPath, {
  foreignKey: {
    name: "templeteId",
    allowNull: false,
  },
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

ImageDataPath.belongsTo(Templete, {
  foreignKey: {
    name: "templeteId",
    allowNull: false,
  },
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

UpdatedData.belongsTo(User, {
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

User.hasMany(UpdatedData, {
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

Templete.hasMany(MappedData, {
  foreignKey: {
    name: "templeteId",
    allowNull: false,
  },
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

MappedData.belongsTo(Templete, {
  foreignKey: {
    name: "templeteId",
    allowNull: false,
  },
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

// MappedData.belongsTo(MetaData);
// MetaData.hasMany(MappedData);
MetaData.belongsTo(MappedData, {
  foreignKey: "templeteId",
  as: "templetedatum", // 👈 Alias added here
});
MappedData.hasMany(MetaData, {
  foreignKey: "templeteId",
  as: "templetedatum", // 👈 Alias added here
});

// MappedData.hasOne(MetaData, { foreignKey: 'attribute', sourceKey: 'value' });
// MetaData.belongsTo(MappedData, { foreignKey: 'attribute', targetKey: 'value' });
ErrorTable.hasMany(ErrorAggregatedTable, {
  foreignKey: "errorTableId",
  as: "aggregatedErrors", // Alias for clarity
});

ErrorAggregatedTable.belongsTo(ErrorTable, {
  foreignKey: "errorTableId",
  as: "error", // Alias for clarity
});

async function startServer() {
  try {
    await createDatabaseIfNotExists(); // Ensure the database exists
    await sequelize.sync({ force: !true }); // Sync database schema
    // await sequelize.sync({ alter: true });
    // Check if admin user exists
    const adminUser = await User.findOne({ where: { role: "Admin" } });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("123456", 12);
      const permissions =  {
          dataEntry: true,
          comparecsv: true,
          csvuploader: true,
          createTemplate: true,
          resultGenerator: true,
        }
      await User.create({
        userName: "admin",
        mobile: "1234567891",
        password: hashedPassword,
        role: "Admin",
        email: "admin@gmail.com",
        permissions: permissions,
      });
      console.log("Admin user created.");
    }

    // Start the server
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
  }
}

// Call the async function
startServer();
