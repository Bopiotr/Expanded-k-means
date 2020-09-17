import {readCsvData} from "./dataReaders/csvReader";
import {Algorithm} from "./algorithm/algorithm";
import {IOptions} from "./Types";
import {euclideanDistance} from "./distanes/distancesFunctions";


async function main() {
    const algorithm: Algorithm = new Algorithm(await readCsvData('./res/kantor.csv'));
    algorithm.options = {
        numClusters: 5,
        prioritization: false,
        distanceFunction: euclideanDistance
    } as IOptions;
    algorithm.buildClusters();
}

main();
