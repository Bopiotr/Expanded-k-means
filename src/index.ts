import {readCsvData} from "./dataReaders/dataR&W";
import {Algorithm} from "./algorithm/algorithm";
import {IImportedData, IInstance, IOptions} from "./Types";
import {euclideanDistance} from "./distanes/distancesFunctions";
import * as express from 'express';
import {Random} from "random-js";

async function main() {
    const app = express();
    app.get('/api/iris', async (req, res) => {
        // const data = await readCsvData('./res/kantor.csv');
        const data = await readCsvData('./res/iris.csv');
        const algorithm: Algorithm = new Algorithm(data, {
            numClusters: 4,
            distanceFunction: euclideanDistance,
            random: "RandomInstances",
            standardScore: [0, 10],
            // reRandomCentroidAfterIterations: 40,
            iterationLimit: 6000,
            removeOutlier: true
        } as IOptions);
        algorithm.buildClusters();
        res.send(algorithm.outputData);
    });

    app.get('/api/points', (req, res) => {
        const points = {attributes: ['x', 'y'], instances: createPoints()} as IImportedData;
        const algorithmPoint: Algorithm = new Algorithm(points, {
            numClusters: 5,
            distanceFunction: euclideanDistance,
            random: 'RandomInstances',
            standardScore: [0, 1000],
            iterationLimit: 30000
        } as IOptions);
        algorithmPoint.buildClusters();
        res.send(algorithmPoint.outputData);
    });
    app.listen(3000);
    console.log('[Server] server are listening on localhost:3000');
}

// async function main() {
//         const points = {attributes: ['x', 'y'], instances: createPoints()} as IImportedData;
//         const algorithmPoint: Algorithm = new Algorithm(points, {
//             numClusters: 5,
//             distanceFunction: euclideanDistance,
//             random: 'RandomInstances',
//             standardScore: [0, 10],
//             removeOutlier: true
//         } as IOptions);
//         algorithmPoint.buildClusters()
// }

main();

function createPoints(): IInstance[] {
    const result = [];
    for (let i = 0; i < 1000; ++i) {
        const x = new Random().real(1, 1000);
        const y = new Random().real(1, 1000);
        result.push({x: x, y: y} as IInstance);
    }
    return result;

}
