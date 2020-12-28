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
    objects: IInstance[];
}

export interface IOptions {
    distanceFunction: DistanceFunctionType;
    numClusters: number;
    standardScore: [number, number];
    random: 'RandomValues' | 'RandomInstances' | 'Dupa';
    iterationLimit?: number;
    reRandomCentroidAfterIterations?: number;
    removeOutlier: boolean;
}

export interface IAnalitycsObjects {
    minValues: IInstance;
    maxValues: IInstance;
    quartiles: [IInstance, IInstance, IInstance];
    average: IInstance;
}


export interface IOutputData {
    values: IInstance[];
    normalizeValues?: IInstance[];
    statistics: IAnalitycsObjects;
    clusters: ICluster[];
    options: IOptions;
    attributes: string[];
    iterations: number;
}
