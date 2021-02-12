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

const absenteeismAtWork = 'small/absenteeism_at_work.csv';
const iris = 'small/iris.csv';


const frogs = 'Frogs_MFCCs.csv';
const gt = 'big/gt_2012.csv';
const live = 'big/fb_posts.csv';
const htru = 'big/HTRU_2.csv';

const main = (data: IImportedData): void => {
    const start = new Date();
    const algorithm = new Algorithm(data, {
        removeOutlier: false,
        numClusters: 4,
        distanceFunction: euclideanDistance(data.attributes),
        random: 'RandomInstances',
        standardScore: [1, 15]
    } as IOptions);
    algorithm.buildClusters();
    console.log('Time: ' + (new Date().getTime() - start.getTime()) + ' ms');
    saveCsvClusters(algorithm.clusters, './out/' + absenteeismAtWork, false);
    const [silhouette, avgSil] = countSilhouette(algorithm.clusters, algorithm.options.distanceFunction);
    console.log(avgSil);
};

readCsvData('./res/' + absenteeismAtWork).then(main);
