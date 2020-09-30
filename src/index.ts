import {readCsvData} from "./dataReaders/csvReader";
import {Algorithm} from "./algorithm/algorithm";
import {IOptions} from "./Types";
import {euclideanDistance} from "./distanes/distancesFunctions";


async function main() {
    const data = await readCsvData('./res/iris.csv');
    // const data = await readCsvData('./res/kantor.csv');
    // data.instances.forEach(val => console.log(val));
    const algorithm: Algorithm = new Algorithm(data, {
        numClusters: 4,
        distanceFunction: euclideanDistance,
        standardScore: [1, 4],
        reRandomCentroidAfterIterations: 1200
    } as IOptions);

    algorithm.buildClusters();
    console.log(algorithm.clusters);
}

main();
