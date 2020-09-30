import {IInstance} from '../Types';

export type DistanceFunctionType = (x: IInstance, y: IInstance) => number;

export const euclideanDistance: DistanceFunctionType = (x: IInstance, y: IInstance): number => {
    for (const yKey in y) {
        if (!x.hasOwnProperty(yKey)) {
            throw new Error('Can\'t calculate distance, objects are not the same');
        }
    }
    let sum = 0;
    for (const attr in x) {
        if (!y.hasOwnProperty(attr)) {
            throw new Error('Can\'t calculate distance, objects are not the same');
        }
        const x1: number = x[attr];
        const y1: number = y[attr];
        sum += Math.abs(x1 - y1)^2;
    }
    return Math.sqrt(sum);
};

export const manhattanDistance: DistanceFunctionType = (x: IInstance, y: IInstance): number => {
    return 2;
};
