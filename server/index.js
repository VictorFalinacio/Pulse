import 'dotenv/config';
import app from './app.js';

const port = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => console.log(`Agile Pulse API listening on port ${port}`));
}

export default app;
