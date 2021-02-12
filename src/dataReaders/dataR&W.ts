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

export function saveCsvClusters(clusters: ICluster[], path: string, includeCentroid: boolean = false) {
    const attr: (keyof IInstance)[] = Object.keys(clusters[0].centroid);
    let result: string = attr.join(',');
    result += ',label\n';
    const objToTab = (obj: IInstance): string[] => {
        const tab: string[] = [];
        attr.forEach(key => tab.push(obj[key].toString()));
        return tab;
    }

    clusters.forEach(({objects, centroid}: { objects: IInstance[], centroid: IInstance }, index: number) => {
        if (includeCentroid) {
            result += objToTab(centroid).join(',') + ',cluster\n';
        }
        objects.forEach(obj => {
            result += objToTab(obj).join(',') + ',C' + index + '\n';
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

export const saveInFile = (content: string, path: string) => {
    fs.writeFile(path, content, function (err) {
        !err ? console.log('File saved') : console.log(err);
    })
}
