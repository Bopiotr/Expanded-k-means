import {IInstance, IImportedData, IOutputData, ICluster} from "../Types";
import {Transform} from "stream";

const fs = require('fs');
const csv = require('csv-parser');

export function csvReader(path: string, readHeaders: (headers: string[]) => void, readData: (data: any) => void): Transform {
    return fs.createReadStream(path)
        .pipe(csv())
        .on('headers', readHeaders)
        .on('data', readData);
}

export async function readCsvData(path: string): Promise<IImportedData> {
    return new Promise(((resolve, reject) => {
        const instances: IImportedData = {attributes: [], instances: []} as IImportedData;
        const readHeaders = (headers: string[]) => {
            instances.attributes = headers;
        };
        const readData = (data: any) => {
            const instance: IInstance = {};
            instances.attributes.forEach((attr: string) => {
                instance[attr] = typeof data[attr] === 'string' ? +data[attr] : data[attr];
            });
            instances.instances.push(instance);
        };
        try {
            csvReader(path, readHeaders, readData)
                .on('end', () => resolve(instances));
        } catch (error) {
            reject(error);
        }
    }))
}

export async function saveCsvClusters(clusters: ICluster[], path: string) {
    let result = 'x,y,label\n'
    clusters.forEach(({objects, centroid}, index) => {
        result += '' + centroid['x'] + ',' + centroid['y'] + ',cluster\n';
        objects.forEach(obj => {
            result += '' + obj['x'] + ',' + obj['y'] + ',C' + index + '\n';
        })
    })
    fs.writeFile(path, result, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log('write success');
        }

    })
}
