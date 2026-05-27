import express, { type Application, type Request, type Response } from "express"




const app: Application = express()




app.get('/', (req: Request, res: Response) => {
    //   res.send('Hello!')
    res.status(200).json({
        "message": "express-Assignment",
        "Author": "Shah Tanzeem Afsar",
    })
})



export default app;