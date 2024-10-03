import express, {NextFunction, Request, Response} from "express";
import responseTime from "response-time";
import {json, urlencoded} from "body-parser"
import cors from "cors";

const app = express();

app.use(cors())
app.use(json())
app.use(urlencoded({extended: true}))

app.get('/', (req: Request, res: Response, next: NextFunction) => {

})


app.post('/authenticate-down', async (req: Request, res: Response, next: NextFunction) => {
    return res.status(500)
})

app.get('/authenticate-slow', async (req: Request, res: Response, next: NextFunction) => {
    const response = await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(res.json({test: 'slow response'}));
        },120000);
    });
    return response;
})


const portNumber = 9009;

app.listen(portNumber, () => console.log(`Server started on port ${portNumber}`))
    .on("error", (e: any) => {
        console.log(e)
    });

