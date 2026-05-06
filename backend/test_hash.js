const bcrypt = require('bcryptjs');

async function generate() {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('senha1234', salt);
    console.log("New hash for senha1234:", hash);
}
generate();
