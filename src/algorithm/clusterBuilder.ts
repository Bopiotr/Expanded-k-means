import {IInstance} from "../Types";
import {DistanceFunctionType} from "../distanes/distancesFunctions";
import {IInstanceWithID} from "./algorithm";

export class ClusterBuilder {
    public points: IInstanceWithID[] = [];
    public distanceMap: Map<[number, number], number>;
    public max: {key: [number, number], value: number} = {value: -1, key: undefined};

    constructor() {
    }

    public build(instances: IInstance[], distanceFunction: DistanceFunctionType): Map<[number, number], number> {
        let iterator = 0;
        this.points = instances.map((item, index) => ({...item, _id: index} as IInstanceWithID))
        const result = new Map<[number, number], number>();
        for (let indexA = 0; indexA < instances.length; ++indexA) {
            for (let indexB = indexA + 1; indexB < instances.length; ++indexB) {
                const distanceAB: number = distanceFunction(this.getPoint(indexA), this.getPoint(indexB));
                result.set([indexA, indexB], distanceAB);
                this.max = this.max.value < distanceAB ? {key: [indexA, indexB], value: distanceAB} : this.max;
            }
            console.clear();
            console.log(iterator++, '/' + (instances.length - 1));
        }
        this.distanceMap = result;
        return this.distanceMap;
    }

    public maxDistance(k: number): number {
        return (this.max.value / k) / 2;
    }

    public getPoint(id: number): IInstance {
        return this.points.find(item => item._id === id) as IInstance
    }

    public deleteById(id: number | number[]): void {
        if (typeof id === 'number') {
            this.deletePoint(id);
            this.max = this.findMax();
            return;
        }
        id.forEach(val => this.deletePoint(val));
        this.max = this.findMax();
    }

    private deletePoint(id: number): void {
        this.points = this.points.filter(value => value._id !== id);
        this.deleteInMap(id);
    }

    public findMax(): {key: [number, number], value: number} {
        let max = {value: -1, key: undefined};
        this.distanceMap.forEach((value: number, key) => max = max.value < value ? {key, value} : max)
        return max;
    }

    private deleteInMap(id: number): void {
        for (const key of this.distanceMap.keys()) {
            const [a, b] = key;
            if (a === id || b === id) {
                this.distanceMap.delete(key);
            }
        }
    }
}
