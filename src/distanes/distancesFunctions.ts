import {IInstance} from '../Instance';

export type DistanceFunctionType = (x: IInstance, y: IInstance, attributes: string[]) => number;

export const euclideanDistance: DistanceFunctionType = (x: IInstance, y: IInstance, attributes: string[]): number => {
    if (!attributes || !attributes.length) {
        return -1;
    }
    let sum = 0;
    attributes.forEach((attr: string) => {
        const x1: number = +x[attr];
        const y1: number = +y[attr];
        sum += Math.abs(x1 - y1)^2;
    });
    return Math.sqrt(sum);
};

export const manhattanDistance: DistanceFunctionType = (x: IInstance, y: IInstance, attributes: string[]): number => {
    return 2;
};
