require('dotenv').config();

const app = require('./src/app');
const connectToDB = require('./src/config/database');
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectToDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server after DB retries:', error);
    process.exit(1);
  }
}

void startServer();