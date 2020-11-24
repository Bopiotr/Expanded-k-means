import {IInstance} from '../Types';

export type DistanceFunctionType = (x: IInstance, y: IInstance) => number;

export const euclideanDistance: DistanceFunctionType = (x: IInstance, y: IInstance): number => {
    let sum = 0;
    for (const attr in x) {
        const x1: number = x[attr];
        const y1: number = y[attr];
        sum += Math.abs(x1 - y1)^2;
    }
    return Math.sqrt(sum);
};
