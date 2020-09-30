import {IInstance, IImportedData} from "../Types";
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
