import {readCsvData} from "./dataReaders/csvReader";
import {Algorithm} from "./algorithm/algorithm";
import {DistancesTypes, IOptions, RandomStyleTypes} from "./Types";


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
