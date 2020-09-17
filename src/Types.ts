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
    prioritization: boolean;
    iterationLimit?: number;
}
