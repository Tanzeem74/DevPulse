import app from "./app"
import config from "./config"
import { initDB } from "./db";
//import { initDB } from "./db";
const port=config.PORT
const main = () => {
    initDB();
    //console.log(config.connection_string);
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

main();