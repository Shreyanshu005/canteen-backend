import app from './app';
import dotenv from 'dotenv';
import { initOrderCleanupJob } from './services/orderCleanup.service';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize background jobs
initOrderCleanupJob();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
