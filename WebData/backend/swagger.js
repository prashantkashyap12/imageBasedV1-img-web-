// swagger.js
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Define Swagger options
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API Documentation for My Express app",
    },
    servers: [
      {
        url: "http://localhost:7000", // Adjust if you have a different server URL
      },
    ],
  },
  //mergeroutes
  // Include all the route files that have Swagger annotations
  apis: [
    "./routes/merge.js", // Include your merge routes
    "./routes/userManagement.js", // Example if you have user-related routes too
    "./routes/templete.js", // Example of other route files to include
    "./routes/settings.js", // Example for settings-related routes
    // Add other route files here that include Swagger annotations
  ],
  //authroutes
//   apis: [
//     "./routes/login.js", // Include your merge routes
//     "./routes/signin.js", // Example if you have user-related routes too
//     // Example for settings-related routes
//     // Add other route files here that include Swagger annotations
//   ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
