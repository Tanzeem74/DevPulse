import dotenv from "dotenv"
import path from "path"
dotenv.config({
    quiet: true,
    path: path.join(process.cwd(), ".env")
})

const config = {
    connection_string: process.env.CONNECTIONSTRING as string,
    secret: process.env.JWT_SECRET,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    PORT: process.env.PORT
};

export default config;