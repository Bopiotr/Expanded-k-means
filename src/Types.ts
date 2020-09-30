import {DistanceFunctionType} from './distanes/distancesFunctions';

export interface IImportedData {
    attributes: string[];
    instances: IInstance[];
}

export interface IInstance {
    [key: string]: number
}

export interface ICluster {
    centroid: IInstance;
    objects: IInstance[];
}

export interface IOptions {
    distanceFunction: DistanceFunctionType;
    numClusters: number;
    standardScore: [number, number];
    iterationLimit?: number;
    reRandomCentroidAfterIterations?: number;
    includeOutlier: boolean;
}

export interface IAnalitycsObjects {
    minValues: IInstance,
    maxValues: IInstance,
    quartiles: [IInstance, IInstance, IInstance]
}
