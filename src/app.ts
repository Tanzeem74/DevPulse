import express, { type Application, type Request, type Response } from "express"
import { authRoute } from "./modules/auth/auth.route";




const app: Application = express()
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    //   res.send('Hello!')
    res.status(200).json({
        "message": "express-Assignment",
        "Author": "Shah Tanzeem Afsar",
    })
})

app.use("/api/auth", authRoute);



export default app;