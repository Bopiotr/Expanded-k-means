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

export const pointsDistance: DistanceFunctionType = (a: IInstance, b: IInstance): number => {
    return Math.sqrt((Math.pow(b.x-a.x, 2) + Math.pow(b.y-a.y, 2)));
}
