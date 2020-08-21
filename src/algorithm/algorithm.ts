import {IInstance, Instances} from "../Instance";
import {Random} from "random-js";
import {DistanceFunctionType, euclideanDistance, manhattanDistance} from "../distanes/distancesFunctions";

export enum DistancesTypes {
    EuclideanDistance = 'Euclidean distance',
    MinkowskiDistance = 'Minkowski distance',
    ManhattanDistance= 'Manhattan distance'
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

export class Algorithm {
    private static defaultOptions: IOptions = {
        numClusters: 4,
        randomStyle: RandomStyleTypes.randomBetween,
        distanceFunction: DistancesTypes.EuclideanDistance,
        prioritization: false
    } as IOptions;

    public instances: Instances;
    public centroids: IInstance[];
    public options: IOptions;

    constructor(data: Instances) {
        this.instances = data;
        this.centroids = [];
        this.options = {} as IOptions;
    }

    public buildClusters(): void {
        const randomStyle = this.options.randomStyle | Algorithm.defaultOptions.randomStyle;
        switch (randomStyle) {
            case RandomStyleTypes.fullyRandom:
                this.fullyRandomCentroids();
                break;
            case RandomStyleTypes.randomBetween:
                this.randomCentroids();
                break;
            default:
                throw new Error('Random Options Error');
        }
        const distanceFunctionType: DistancesTypes = !!this.options.distanceFunction ? this.options.distanceFunction : Algorithm.defaultOptions.distanceFunction;
        let distance = undefined;
        switch (distanceFunctionType) {
            case DistancesTypes.EuclideanDistance:
                distance = euclideanDistance;
                break;
            case DistancesTypes.ManhattanDistance:
                distance = manhattanDistance;
                break;
            default:
                throw new Error('Distance Function Error');
        }
        const distanceMap: number[][] = this.buildDistanceMap(distance);

    }

    private randomCentroids(): void {
        const minValuesInstance: IInstance = {...this.instances.instances[0]};
        const maxValuesInstance: IInstance = {...this.instances.instances[0]};
        this.instances.attributes.forEach((attr: string) => {
            this.instances.instances.forEach((inst: IInstance) => {
                maxValuesInstance[attr] = +inst[attr] < +maxValuesInstance[attr] ? inst[attr] : maxValuesInstance[attr];
                minValuesInstance[attr] = +inst[attr] > +minValuesInstance[attr] ? inst[attr] : minValuesInstance[attr];
            })
        });
        this.centroids = [];
        const random: Random = new Random();
        const k = this.options.numClusters | Algorithm.defaultOptions.numClusters;
        for (let i = 0; i < k; ++i) {
            const centroid: IInstance = {};
            this.instances.attributes.forEach((attr: string) => {
                centroid[attr] = random.real(+minValuesInstance[attr], +maxValuesInstance[attr]);
            });
            this.centroids = [...this.centroids, centroid];
        }
    }

    private fullyRandomCentroids(): void {
        this.centroids = [];
        const random: Random = new Random();
        const k = this.options.numClusters | Algorithm.defaultOptions.numClusters;
        for (let i = 0; i < k; ++i) {
            const centroid: IInstance = {};
            this.instances.attributes.forEach((attr: string) => {
                centroid[attr] = random.int32();
            });
            this.centroids = [...this.centroids, centroid];
        }
    }

    /*
    * Distance Map example
    *       Cluster1    Cluster2    Cluster3    Cluster4    nearest(indexOf)
    * Ob1   5           8           2           4           Cluster3
    * Ob2   5.5         3           8           7           Cluster2
    * Ob3   53          1           6           1           Cluster2
    * Ob4   2           3           24          2.5         Cluster4
    * Ob5   1           82          2           3           Cluster1
    * */
    private buildDistanceMap(distance: DistanceFunctionType): number[][] {
        if (!this.instances || !this.centroids) {
            throw new Error('Error building distanceMap');
        }
        let result: number[][] = [];
        for (let i = 0; i < this.instances.instances.length; ++i) {
            const inst = this.instances.instances[i];
            result.push([]);
            for (let j = 0; j < this.options.numClusters; ++j) {
                result[i].push(distance(inst, this.centroids[j], this.instances.attributes));
            }
        }
        for (const res of result) {
            res.push(this.minimum(res));
        }
        return result;
    }

    /*
    * return index of minimum value in array
    * */
    private minimum(array: number[]): number {
        let min = array[0];
        for (let i = 1; i < array.length; ++i) {
            min = min > array[i] ? array[i] : min;
        }
        return array.indexOf(min);
    }
}

/*
*   IDEA FOR CENTROID
* first centroids style
*   1) Fully random
*   2) Random between minValues & maxValues // O(n^2)
*   3) Sort by most important atrribute and create centroids by part measures (new method)
* */

/*
*   idea of prioritization
* */


















