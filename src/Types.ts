import {DistanceFunctionType} from './distanes/distancesFunctions';

export interface IImportedData {
    attributes: string[];
    instances: IInstance[];
}

export interface IInstance {
    [key: string]: number;
}

export interface ICluster {
    centroid: IInstance;
    objects: (IInstanceWithID | IInstance)[];
}

export interface IOptions {
    distanceFunction: DistanceFunctionType; // euclidean
    numClusters: number; // dla najlepszego
    standardScore: [number, number]; //
    random: 'RandomValues' | 'RandomInstances' | 'CountClusters';
    iterationLimit?: number;
    removeOutlier: boolean; // false, remove only on countClusters
}

export interface IAnalitycsObjects {
    minValues: IInstance;
    maxValues: IInstance;
    quartiles: Quartiles;
    average: IInstance;
}

export type Quartiles = [IInstance, IInstance, IInstance];


export interface IOutputData {
    values: IInstance[];
    normalizeValues?: IInstance[];
    statistics: IAnalitycsObjects;
    clusters: ICluster[];
    options: IOptions;
    attributes: string[];
    iterations: number;
    firstClusters: ICluster[];
}

export interface IInstanceWithID extends IInstance {
    __id: number
}
