const app = require('../apps/app');
const config = require('config');

const server = app.listen(port = config.get('app.port'), (req, res) => {
    console.log(`server running on port ${port}`);
})