import {readCsvData} from "./dataReaders/dataR&W";
import {Algorithm} from "./algorithm/algorithm";
import {IImportedData, IInstance, IOptions} from "./Types";
import {euclideanDistance, pointsDistance} from "./distanes/distancesFunctions";
import * as express from 'express';
import {Random} from "random-js";

async function startServer() {
    const app = express();
    app.get('/api/iris', async (req, res) => {
        // const data = await readCsvData('./res/kantor.csv');
        const data = await readCsvData('./res/iris.csv');
        const algorithm: Algorithm = new Algorithm(data, {
            numClusters: 4,
            distanceFunction: euclideanDistance,
            random: "RandomInstances",
            standardScore: [0, 80],
            // reRandomCentroidAfterIterations: 40,
            iterationLimit: 30000,
            removeOutlier: true
        } as IOptions);
        algorithm.buildClusters();
        res.send(algorithm.outputData);
    });

    app.get('/api/kantor', async (req, res) => {
        const data = await readCsvData('./res/kantor.csv');
        const algorithm: Algorithm = new Algorithm(data, {
            numClusters: 4,
            distanceFunction: euclideanDistance,
            random: "RandomInstances",
            standardScore: [0, 80],
            // reRandomCentroidAfterIterations: 40,
            iterationLimit: 30000,
            removeOutlier: true
        } as IOptions);
        algorithm.buildClusters();
        res.send(algorithm.outputData);
    });

    app.get('/api/points', (req, res) => {
        const points = {attributes: ['x', 'y'], instances: createPoints()} as IImportedData;
        const algorithmPoint: Algorithm = new Algorithm(points, {
            numClusters: 6,
            distanceFunction: pointsDistance,
            random: 'Dupa',
            standardScore: [0, 1000],
            iterationLimit: 10000
        } as IOptions);
        algorithmPoint.buildClusters();
        res.send(algorithmPoint.outputData);
    });
    app.listen(3000);
    console.log('[Server] server are listening on localhost:3000');
}

function pointsLocal() {
        const points = {attributes: ['x', 'y'], instances: createPoints()} as IImportedData;
        const start = new Date();
        const algorithmPoint: Algorithm = new Algorithm(points, {
            numClusters: 4,
            distanceFunction: pointsDistance,
            random: 'Dupa',
            standardScore: [0, 1000],
            removeOutlier: true
        } as IOptions);
        const stop = new Date();
        console.log('time: ', (stop.getMilliseconds() - start.getMilliseconds()))
        // algorithmPoint.buildClusters();
        // console.log(algorithmPoint.outputData.clusters);
}

async function main() {
    // pointsLocal();
    await startServer();
}

// server is created for testing in web app

function createPoints(): IInstance[] {
    const result = [];
    for (let i = 0; i < 1500; ++i) {
        const x = new Random().real(1, 1000);
        const y = new Random().real(1, 1000);
        result.push({x: x, y: y} as IInstance);
    }
    return result;
}

main();
