import {IInstance} from '../Types';

export type DistanceFunctionType = (x: IInstance, y: IInstance) => number;

export const euclideanDistance: DistanceFunctionType = (x: IInstance, y: IInstance): number => {
    let sum = 0;
    for (const attr in x) {
        let v = x[attr] - y[attr];
        if (v < 0) {
            v = -v;
        }
        sum += Math.pow(v, 2);
    }
    return Math.pow(sum, 0.5);
};

export const pointsDistance: DistanceFunctionType = (a: IInstance, b: IInstance): number => {
    return Math.sqrt((Math.pow(b.x-a.x, 2) + Math.pow(b.y-a.y, 2)));
}

export const minkowskiDistance: DistanceFunctionType = (x: IInstance, y: IInstance, p = 2) => {
    let sum = 0;
    for (const attr in x) {
        let v = x[attr] - y[attr];
        if (v < 0) {
            v = -v;
        }
        sum += Math.pow(v, p);
    }
    return Math.pow(sum, 1/p);
}

export const mhttnDistance: DistanceFunctionType = (x: IInstance, y: IInstance) => {
    let sum = 0;
    for (const attr in x) {
        let v = x[attr] - y[attr];
        if (v < 0) {
            v = -v;
        }
        sum += v;
    }
    return sum;
}

export const hammingDistance: DistanceFunctionType = (x: IInstance, y: IInstance) => {
    let result = 0;
    for (const attr in x) {
        if (x[attr] !== y[attr]) {
            ++result;
        }
    }
    return result;
}
