import express, {NextFunction, Request, Response} from "express";
import responseTime from "response-time";
import {json, urlencoded} from "body-parser"
import cors from "cors";
import DummyModel from "./models/DummyModel";

const bigMultiplication = () => {
    const num1 = BigInt(999999999999999999999999999999999999999999999999999999999999999999999999999999999n)
    const num2 = BigInt(999999999999999999999999999999999999999999999999999999999999999999999999999999999n)
    return (num1 * num2 / num2 + num1) * (num1 / num2 / num2 + num1)
}

const prime = (upperLimit: number) => {
    const startTime = process.hrtime();

    const primes: number[] = [];
    for (let i = 2; i <= upperLimit; i++) {
        let isPrime = true;
        for (let j = 2; j <= Math.sqrt(i); j++) {
            if (i % j === 0) {
                isPrime = false;
                break;
            }
        }

        if (isPrime) {
            primes.push(i);
        }
    }

    const endTime = process.hrtime(startTime);
    const elapsedTime = endTime[0] * 1e9 + endTime[1];

    return {
        primes: primes,
        elapsedTime: elapsedTime
    }
}

function get(url: RequestInfo, timeout: number) {
    const controller = new AbortController();
    return Promise.race([fetch(url, {
        signal: controller.signal
    }), new Promise((resolve, reject) => {
        setTimeout(() => {
            reject("request was not fulfilled in time");
            controller.abort();
        }, timeout)
    })]);
}

const app = express();

app.use(cors())
app.use(json())
app.use(urlencoded({extended: true}))
app.use(responseTime(function (req, res, time) {
    const stat = (req.method ?? "" + req.url ?? "").toLowerCase()
        .replace(/[:.]/g, '')
        .replace(/\//g, '_')
    // TODO: Send to otel server
}))
app.get('/', (req: Request, res: Response, next: NextFunction) => {
    bigMultiplication()
    res.json({
        message: bigMultiplication().toString()
    })
})

app.get('/dependent-service-down', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await fetch('http://another-service:9009/authenticate-down')
        bigMultiplication()
        const result = prime(100)
        res.json({test: 'dependent service responded',primeTimeElapsed: result.elapsedTime})
    } catch (e) {
        return res.json({test: 'dependent service down'})
    }
})
app.get('/dependent-service-slow', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await get('http://another-service:9009/authenticate-slow', 2000)
        bigMultiplication()
        const result = prime(100)
        res.json({test: 'dependent service responded',primeTimeElapsed: result.elapsedTime})
    } catch (e) {
        return res.json({test: 'dependent service request timed out'})
    }
})

app.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const urlParam = req.params['id']
    try {
        const foundModel = await DummyModel.findOne({
            where: {
                key: urlParam
            }
        })
        bigMultiplication()
        const result = prime(100)
        res.json({
            found: foundModel,
            primeTimeElapsed: result.elapsedTime
        })
    } catch (e) {
        console.log(e)
    }
})

app.post('/', async (req: Request, res: Response, next: NextFunction) => {

    try {
        const receivedModel = new DummyModel()

        //extract data
        receivedModel.set("key", req.body["key"])
        receivedModel.set("value", req.body["value"])

        //save entity
        const saved = await receivedModel.save();
        //send response back
        res.json({
            message: "Success",
            savedEntity: saved
        })
    } catch (e) {
        console.log(e)
    }
})


const portNumber = 5000;

app.listen(portNumber, () => console.log(`Server started on port ${portNumber}`))
    .on("error", (e: any) => {
        console.log(e)
    });

