import {readCsvData} from "./dataReaders/dataR&W";
import {Algorithm} from "./algorithm/algorithm";
import {IImportedData, IInstance, IOptions, IOutputData} from "./Types";
import {euclideanDistance, pointsDistance} from "./distanes/distancesFunctions";
import * as express from 'express';
import {Random} from "random-js";
import {countSilhouette} from "./silhouetteAnalysis";

async function startServer() {
    const app = express();
    const irisy: IOutputData = await absLocal();
    app.get('/api/iris', async (req, res) => {
        res.send(irisy);
    });

    app.get('/api/kantor', async (req, res) => {
        const data = await readCsvData('./res/kantor.csv');
        const algorithm: Algorithm = new Algorithm(data, {
            numClusters: 4,
            distanceFunction: euclideanDistance,
            random: "RandomInstances",
            standardScore: [0, 100],
            iterationLimit: 30000,
            removeOutlier: true
        } as IOptions);
        algorithm.buildClusters();
        res.send(algorithm.outputData);
    });

    const dupa: IOutputData = pointsLocal();

    app.get('/api/points', (req, res) => {
        res.send(dupa);
    });
    app.listen(3000);
    console.log('[Server] server are listening on localhost:3000');
}

async function irisLocal() {
    const data = await readCsvData('./res/iris.csv');
    const algorithm: Algorithm = new Algorithm(data, {
        numClusters: 4,
        distanceFunction: euclideanDistance,
        random: 'Dupa',
        standardScore: [0, 10],
        iterationLimit: 30000,
        removeOutlier: true
    } as IOptions);
    algorithm.buildClusters();
    return algorithm.outputData;
}

async function absLocal() {
    const data = await readCsvData('./res/absenteeism_at_work.csv');
    const algorithm: Algorithm = new Algorithm(data, {
        numClusters: 5,
        distanceFunction: euclideanDistance,
        random: 'RandomInstances',
        standardScore: [0, 40],
        iterationLimit: 30000,
        removeOutlier: true
    } as IOptions);
    algorithm.buildClusters();
    return algorithm.outputData;
}

function pointsLocal() {
        const points = {attributes: ['x', 'y'], instances: createPoints()} as IImportedData;
        const start = new Date();
        const algorithmPoint: Algorithm = new Algorithm(points, {
            numClusters: 6,
            distanceFunction: pointsDistance,
            random: 'Dupa',
            standardScore: [0, 1000],
            removeOutlier: true
        } as IOptions);
        const stop = new Date();
        console.log('time: ', (stop.getMilliseconds() - start.getMilliseconds()))
        algorithmPoint.buildClusters();
        return algorithmPoint.outputData;
        // console.log(algorithmPoint.outputData.firstClusters);
        // console.log(algorithmPoint.outputData.clusters);
}

function main() {
    // pointsLocal();
    // await startServer();
    const points = {attributes: ['x', 'y'], instances: createPoints()} as IImportedData;
    const alg = new Algorithm(points, {
        random: 'Dupa',
        numClusters: 4,
        removeOutlier: true,
        standardScore: [0, 60],
        distanceFunction: pointsDistance
    } as IOptions);
    alg.buildClusters();
    const result = countSilhouette(alg.clusters, alg.options.distanceFunction);
    console.log(result);
}

// server is created for testing in web app

function createPoints(): IInstance[] {
    const result = [];
    for (let i = 0; i < 47; ++i) {
        const x = new Random().real(1, 60);
        const y = new Random().real(1, 60);
        result.push({x: x, y: y} as IInstance);
    }
    return result;
}

main();
