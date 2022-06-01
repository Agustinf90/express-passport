require("dotenv").config();

let config = {
    port: process.env.PORT,
    secret_key: process.env.SECRET_KEY_SESSION
}

module.exports = { config };