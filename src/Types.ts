export interface IImportedData {
    attributes: string[];
    instances: IInstance[];
}

export interface IInstance {
    [key: string]: string | number
}

export interface ICluster {
    centroid: IInstance;
    objects: IInstance[];
}

export enum DistancesTypes {
    EuclideanDistance = 'Euclidean distance',
    MinkowskiDistance = 'Minkowski distance',
    ManhattanDistance = 'Manhattan distance',
    Custom = 'Custom'
}

export enum RandomStyleTypes {
    'fullyRandom',
    'randomBetween'
}

export interface IOptions {
    distanceFunction: DistancesTypes;
    randomStyle: RandomStyleTypes;
    numClusters: number;
    prioritization: boolean;
}
