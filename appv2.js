import bodyParser from 'body-parser';
import express, { json as _json } from "express";
import cors from 'cors';
import dotenv from 'dotenv'
import LoginRoutes from './src/api/v1/login/LoginRoutes/index.js';
import ScanRoutes from './src/api/v1/scan/ScanRoutes/index.js';

dotenv.config()


const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,

}


const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors(corsOptions));

app.use('/api/v1/next-gen',LoginRoutes)

app.use('/api/v1/next-gen/scan',ScanRoutes)


app.listen(8888, () => {
    console.log('Events service started at http://localhost:8888')
});