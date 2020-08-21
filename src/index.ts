import {readCsvData} from "./dataReaders/csvReader";
import {Algorithm, DistancesTypes, IOptions, RandomStyleTypes} from "./algorithm/algorithm";

async function main() {
    const algorithm: Algorithm = new Algorithm(await readCsvData('./res/kantor.csv'));
    algorithm.options = {
        numClusters: 5,
        prioritization: false,
        distanceFunction: DistancesTypes.EuclideanDistance,
        randomStyle: RandomStyleTypes.randomBetween
    } as IOptions;
    algorithm.buildClusters();
}

main();
