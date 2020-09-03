import {IInstance, IImportedData, ICluster, IOptions, RandomStyleTypes, DistancesTypes} from "../Types";
import {Random} from "random-js";
import {DistanceFunctionType, euclideanDistance, manhattanDistance} from "../distanes/distancesFunctions";

export class Algorithm {
    private static defaultOptions: IOptions = {
        numClusters: 4,
        randomStyle: RandomStyleTypes.randomBetween,
        distanceFunction: DistancesTypes.EuclideanDistance,
        prioritization: false
    } as IOptions;

    public attributes: string[];
    public instances: IInstance[];
    public clusters: ICluster[];
    public options: IOptions;

    constructor(data: IImportedData, options?: IOptions) {
        this.instances = data.instances;
        this.attributes = data.attributes;
        this.options = options || Algorithm.defaultOptions;
    }

    private distanceFunction: DistanceFunctionType;

    public buildClusters(customDistance?: DistanceFunctionType): void {
        this.prepareClusters(customDistance);

    }

    public moveCentroids()

    private prepareClusters(customDistance?: DistanceFunctionType): void {
        switch (this.options.randomStyle) {
            case RandomStyleTypes.fullyRandom:
                this.fullyRandomCentroids();
                break;
            case RandomStyleTypes.randomBetween:
                this.randomCentroids();
                break;
            default:
                throw new Error('Random Options is not defined');
        }
        switch (this.options.distanceFunction) {
            case DistancesTypes.EuclideanDistance:
                this.distanceFunction = euclideanDistance;
                break;
            case DistancesTypes.ManhattanDistance:
                this.distanceFunction = manhattanDistance;
                break;
            case DistancesTypes.Custom:
                if (!customDistance) {
                    console.warn('[Warning] Custom distance function not provided, but in option is custom type declared. Instead, a Euclidean function will be used');
                    this.distanceFunction = euclideanDistance;
                } else {
                    this.distanceFunction = customDistance;
                }
                break;
            default:
                throw new Error('Distance Function is not defined');
        }
        this.assignObjectsToClusters();
    }

    private randomCentroids(): void {
        const minValuesInstance: IInstance = {...this.instances[0]};
        const maxValuesInstance: IInstance = {...this.instances[0]};
        this.attributes.forEach((attr: string) => {
            this.instances.forEach((inst: IInstance) => {
                maxValuesInstance[attr] = +inst[attr] < +maxValuesInstance[attr] ? inst[attr] : maxValuesInstance[attr];
                minValuesInstance[attr] = +inst[attr] > +minValuesInstance[attr] ? inst[attr] : minValuesInstance[attr];
            })
        });
        this.clusters = [];
        const random: Random = new Random();
        for (let i = 0; i < this.options.numClusters; ++i) {
            const centroid: IInstance = {};
            this.attributes.forEach((attr: string) => {
                centroid[attr] = random.real(+minValuesInstance[attr], +maxValuesInstance[attr]);
            });
            this.clusters.push({centroid: centroid, objects: []} as ICluster);
        }
    }

    private fullyRandomCentroids(): void {
        this.clusters = [];
        const random: Random = new Random();
        for (let i = 0; i < this.options.numClusters; ++i) {
            const centroid: IInstance = {};
            this.attributes.forEach((attr: string) => {
                centroid[attr] = random.int32();
            });
            this.clusters.push({centroid: centroid, objects: []} as ICluster);
        }
    }

    private assignObjectsToClusters() {
        if (!this.distanceFunction) {
            throw new Error('Distance function is undefined');
        }
        for (let i = 0; i < this.instances.length; ++i) {
            let nearestCent: { centroidIndex: number, distance: number } = {
                centroidIndex: 0,
                distance: this.distanceFunction(this.instances[i], this.clusters[0].centroid, this.attributes)
            };
            for (let j = 1; j < this.clusters.length; ++j) {
                const distance: number = this.distanceFunction(this.instances[i], this.clusters[j].centroid, this.attributes);
                if (distance < nearestCent.distance) {
                    nearestCent = {
                        centroidIndex: j,
                        distance: distance
                    };
                }
            }
            this.clusters[nearestCent.centroidIndex].objects.push(this.instances[i]);
        }
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

/*
* Idea of diffrent options objects
*
* */

















