import {readCsvData, saveCsvClusters, saveInFile} from "./dataReaders/dataR&W";
import {Algorithm} from "./algorithm/algorithm";
import {IImportedData, IInstance, IOptions, IOutputData} from "./Types";
import {defaultDistance, euclideanDistance, mhttnDistance, pointsDistance} from "./distanes/distancesFunctions";
import {countSilhouette} from "./silhouetteAnalysis";
import {Utils} from "./algorithm/utils";
import {date} from "random-js";



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
const points1 = 'small/points1.csv';
const points2 = 'small/points2.csv';


const frogs = 'Frogs_MFCCs.csv';
const gt = 'big/gt_2012.csv';
const live = 'big/fb_posts.csv';
const htru = 'big/HTRU_2.csv';

const test = (data: IImportedData, k: number, name: string): void => {
    let result = 'Test ' + name + '\ntest CountClusters\n';
    const options_1 = {
        removeOutlier: false,
        numClusters: k,
        distanceFunction: euclideanDistance(data.attributes),
        random: 'CountClusters',
        standardScore: [1, 15]
    } as IOptions;
    result += singleTest({...data}, options_1);
    result += '\ntest RandomInstances\n';
    const options_2 = {
        ...options_1,
        random: 'RandomInstances'
    } as IOptions;
    result += multipleTest({...data}, options_2);
    saveInFile(result, './out/' + name + 'Test.csv');
};

const singleTest = (data: IImportedData, options: IOptions): string => {
    let result = 'Ilosc iteracji,avg silhuette,czas [ms]\n';
    let start = new Date();
    const alg = new Algorithm(data, options);
    alg.buildClusters();
    let stop = new Date();
    const time = stop.getTime() - start.getTime();
    const k = alg.outputData.iterations;
    const [, avgSil] = countSilhouette(alg.clusters, alg.options.distanceFunction);
    result += '' + k + ',' + avgSil + ',' + time + '\n';
    return result;
}

const multipleTest = (data: IImportedData, options: IOptions): string => {
    let result = 'Proba,Ilosc iteracji,avg silhuette,czas [ms]\n';
    for(let i = 1; i <= 10; ++i) {
        const start = new Date();
        const alg = new Algorithm(data, options);
        alg.buildClusters();
        const stop = new Date();
        const iterations = alg.outputData.iterations;
        const [, avgSil] = countSilhouette(alg.clusters, alg.options.distanceFunction);
        const time = stop.getTime() - start.getTime();
        result += '' + i + ',' + iterations + ',' + avgSil + ',' + time + '\n';
    }
    return result;
}

readCsvData('./res/' + iris).then(data => test(data, 3, iris));
readCsvData('./res/' + absenteeismAtWork).then(data => test(data, 3, absenteeismAtWork));
readCsvData('./res/' + live).then(data => test(data, 3, live));
readCsvData('./res/' + frogs).then(data => test(data, 3, frogs));
readCsvData('./res/' + htru).then(data => test(data, 3, htru));
readCsvData('./res/' + gt).then(data => test(data, 3, gt));
readCsvData('./res/' + points1).then(data => test(data, 3, points1));
readCsvData('./res/' + points2).then(data => test(data, 3, points2));


