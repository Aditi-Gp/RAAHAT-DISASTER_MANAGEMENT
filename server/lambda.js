const serverless = require("serverless-http");
const app = require("./app");

// Export the handler for AWS Lambda
module.exports.handler = serverless(app);

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;

  if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`🚀 Lambda function running locally on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  }
}
