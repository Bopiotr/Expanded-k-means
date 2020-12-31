import {IInstance} from "../Types";
import {DistanceFunctionType} from "../distanes/distancesFunctions";

export class DistanceMap {
    private _distanceMap: Map<[number, number], number>;
    private max: {key: [number, number], value: number} = {value: -1, key: undefined};

    constructor() {
    }

    public get distanceMap(): Map<[number, number], number> {
        return this._distanceMap;
    }

    public get maxDistance(): number {
        return this.max.value;
    }

    public build(instances: IInstance[], distanceFunction: DistanceFunctionType): Map<[number, number], number> {
        const result = new Map<[number, number], number>();
        for (let indexA = 0; indexA < instances.length; ++indexA) {
            for (let indexB = indexA + 1; indexB < instances.length; ++indexB) {
                const distanceAB: number = distanceFunction(instances[indexA], instances[indexB]);
                result.set([indexA, indexB], distanceAB);
                this.max = this.max.value < distanceAB ? {key: [indexA, indexB], value: distanceAB} : this.max;
            }
        }
        this._distanceMap = result;
        return this.distanceMap;
    }
}
