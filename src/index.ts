import {readCsvData, saveCsvClusters} from "./dataReaders/dataR&W";
import {Algorithm} from "./algorithm/algorithm";
import {IImportedData, IInstance, IOptions, IOutputData} from "./Types";
import {euclideanDistance, mhttnDistance, pointsDistance} from "./distanes/distancesFunctions";
import {countSilhouette} from "./silhouetteAnalysis";



// const alg = new Algorithm(points, {
//     random: 'CountClusters',
//     numClusters: 3,
//     removeOutlier: true,
//     standardScore: [0, 10],
//     distanceFunction: mhttnDistance
// } as IOptions);
// alg.buildClusters();
// const result = alg.outputData;
// const silhouette = countSilhouette(alg.clusters, alg.options.distanceFunction);
// silhouette.forEach(val => val.sort((a, b) => a > b ? -1 : a === b ? 0 : 1));
// console.log(silhouette);
// saveCsvClusters(result.clusters, './res/pointsOut.csv');
const absenteeismAtWork = 'absenteeism_at_work.csv';
const iris = 'iris.csv';

const main = (data: IImportedData): void => {
    const options: IOptions = {
        removeOutlier: true,
        numClusters: 3,
        distanceFunction: euclideanDistance,
        random: 'CountClusters',
        standardScore: [0, 15]
    };
    const algorithm = new Algorithm(data, options);
    algorithm.buildClusters();
    saveCsvClusters(algorithm.clusters, './out/' + absenteeismAtWork, false);
};

readCsvData('./res/' + absenteeismAtWork).then(main);
