import {readCsvData, saveCsvClusters} from "./dataReaders/dataR&W";
import {Algorithm} from "./algorithm/algorithm";
import {IImportedData, IInstance, IOptions, IOutputData} from "./Types";
import {defaultDistance, euclideanDistance, mhttnDistance, pointsDistance} from "./distanes/distancesFunctions";
import {countSilhouette} from "./silhouetteAnalysis";
import {Utils} from "./algorithm/utils";



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
const iris = 'small/iris.csv';
const frogs = 'Frogs_MFCCs.csv';
const gt = 'big/gt_2012.csv';
const live = 'fb_posts.csv';

const main = (data: IImportedData): void => {
    const options: IOptions = {
        removeOutlier: false,
        numClusters: 4,
        distanceFunction: euclideanDistance(data.attributes),
        random: 'CountClusters',
        standardScore: [1, 15]
    };
    const algorithm = new Algorithm(data, options);
    algorithm.buildClusters();
    saveCsvClusters(algorithm.clusters, './out/' + iris, false);
    const [silhouette, avgSil] = countSilhouette(algorithm.clusters, algorithm.options.distanceFunction);
    console.log(avgSil);
};

readCsvData('./res/' + iris).then(main);
