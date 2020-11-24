import {IInstance, IImportedData, ICluster, IOptions, IAnalitycsObjects, IOutputData} from '../Types';
import {Random} from 'random-js';
import {euclideanDistance} from '../distanes/distancesFunctions';

export class Algorithm {
    private static defaultOptions: IOptions = {
        numClusters: 4,
        distanceFunction: euclideanDistance,
        removeOutlier: false,
        random: "RandomInstances",
        standardScore: [0, 10]
    } as IOptions;

    public attributes: string[];
    public clusters: ICluster[];
    public options: IOptions;
    public analityc: IAnalitycsObjects;
    public distanceGrid: number[][] = [];
    public readonly instances: IInstance[];
    public readonly copyInstances: IInstance[];

    private iterations: number;

    constructor(data: IImportedData, options?: IOptions) {
        this.attributes = data.attributes;
        this.options = options || Algorithm.defaultOptions;
        let filteredData = data.instances
            .filter(item => !this.hasUndefined(item));
        if (this.options.removeOutlier) {
            this.analityc = {...this.analityc, quartiles: this.countQuartile(filteredData), average: this.average(filteredData)}
            filteredData = [...this.filterOutlier(filteredData)];
        }
        this.analityc = {...this.analityc, ...this.countMinAndMaxValues(filteredData)};
        this.copyInstances = [...filteredData];
        this.instances = this.normalizeInstances(filteredData);
        for(let i = 0; i < this.instances.length; ++i) {
            this.distanceGrid.push([]);
            for (let j = 0; j < this.instances.length; ++j) {
                if (i === j) {
                    this.distanceGrid[i].push(null);
                }
                this.distanceGrid[i].push(this.options.distanceFunction(this.instances[i], this.instances[j]));
            }
        }
        console.log(this.distanceGrid);

    }

    public get outputData(): IOutputData {
        if (!this.clusters || !this.clusters.length) {
            return null;
        }
        return {
            values: this.copyInstances,
            normalizeValues: this.instances,
            options: this.options,
            clusters: this.clusters,
            statistics: this.analityc,
            attributes: this.attributes,
            iterations: this.iterations || -1,
            objectsLength: this.instances.length
        } as IOutputData;
    }
// Siatka/ Mapa odległości 
    public buildClusters(): void {
        this.options.random === 'RandomValues' ? this.randomClusters() : this.assignRandomInstancesAsClusters();
        let continueIterations = false;
        let iterator = 0;
        do {
            if (this.options.reRandomCentroidAfterIterations && (iterator % this.options.reRandomCentroidAfterIterations === 0)) {
                this.options.random === 'RandomValues' ? this.randomClusters() : this.assignRandomInstancesAsClusters();
            }
            this.assignObjectsToClusters();
            continueIterations = false;
            ++iterator;
            this.clusters.forEach((value: ICluster, index: number) => {
                let newMid: IInstance = {};
                this.attributes.forEach(attr => {
                    const sum: number = value.objects.map(item => item[attr])
                        .reduce((total: number, aNumber: number) => total + aNumber, 0);
                    newMid[attr] = sum / value.objects.length;
                    // bug: comparnig doubles !!!
                    if ((!this.options.iterationLimit || iterator < this.options.iterationLimit)) {
                        continueIterations = continueIterations || (Math.abs(newMid[attr] - value.centroid[attr]) > 0.0001);
                    }
                });
                this.clusters[index] = {
                    ...value,
                    centroid: !value.objects.length ? this.clusters[index].centroid : newMid
                } as ICluster;
            });
            console.clear();
            console.log(iterator);
        } while (continueIterations);
        this.iterations = iterator;
    }

    private countMinAndMaxValues(instances: IInstance[]): IAnalitycsObjects {
        if (!instances || !instances.length) {
            return {
                minValues: {},
                maxValues: {}
            } as IAnalitycsObjects;
        }
        const minValuesInstance: IInstance = {...instances[0]};
        const maxValuesInstance: IInstance = {...instances[0]};
        this.attributes.forEach((attr: string) => {
            instances.forEach((inst: IInstance) => {
                maxValuesInstance[attr] = +inst[attr] < +maxValuesInstance[attr] ? inst[attr] : maxValuesInstance[attr];
                minValuesInstance[attr] = +inst[attr] > +minValuesInstance[attr] ? inst[attr] : minValuesInstance[attr];
            })
        });
        return {
            minValues: maxValuesInstance,
            maxValues: minValuesInstance
        } as IAnalitycsObjects;
    }

    private randomClusters(): void {
        this.clusters = [];
        const minVal = this.options.standardScore && this.options.standardScore[0];
        const maxVal = this.options.standardScore && this.options.standardScore[1];
        const random = new Random();
        for (let i = 0; i < this.options.numClusters; ++i) {
            const centroid: IInstance = {};
            this.attributes.forEach((attr: string) => {
                centroid[attr] = random.real(minVal || this.analityc.minValues[attr], maxVal || this.analityc.maxValues[attr]);
            });
            this.clusters.push({centroid: centroid, objects: []} as ICluster);
        }
    }

    private assignRandomInstancesAsClusters(): void {
        this.clusters = [];
        const random = new Random();
        for (let i = 0; i < this.options.numClusters; ++i) {
            this.clusters.push({
                centroid: {...this.instances[random.integer(0, this.instances.length)]},
                objects: []
            } as  ICluster);
        }
    }

    private assignObjectsToClusters(): void {
        if (!this.options.distanceFunction) {
            throw new Error('Distance function is undefined');
        }
        const newClusters: ICluster[] = this.clusters.map(value => ({
            centroid: value.centroid,
            objects: []
        } as ICluster));

        this.instances.forEach((currentInstance: IInstance) => {
            let nearestCent = {
                centroidIndex: 0,
                distance: this.options.distanceFunction(currentInstance, this.clusters[0].centroid)
            };
            this.clusters.forEach((currentCluster: ICluster, clusterIndex: number) => {
                const distance: number = this.options.distanceFunction(currentInstance, currentCluster.centroid);
                if (distance < nearestCent.distance) {
                    nearestCent = {
                        centroidIndex: clusterIndex,
                        distance: distance
                    };
                }
            });
            newClusters[nearestCent.centroidIndex].objects.push(currentInstance);
        });
        this.clusters = newClusters;
    }

    private normalizeInstances(instances: IInstance[]): IInstance[] {
        if (!this.options.standardScore) {
            throw Error('Standard Score not provided');
        } else if (!instances || !instances.length) {
            return [];
        }
        const [c, d]: [number, number] = this.options.standardScore;
        return instances.map((item: IInstance) => {
            const newItem: IInstance = {};
            for (let attr in item) {
                const [a, b] = [this.analityc.minValues[attr], this.analityc.maxValues[attr]];
                newItem[attr] = (d - c) / (b - a) * (item[attr] - a) + c;
            }
            return newItem;
        });
    }

    private hasUndefined(item: any): boolean {
        for (let itemKey in item) {
            if (!item[itemKey]) {
                return true;
            }
        }
        return false;
    }

    private filterOutlier(data: IInstance[], k: number = 1.5): IInstance[] {
        let result = [...data];
        this.attributes.forEach(attr => {
            const q1 = this.analityc.quartiles[0][attr];
            const q3 = this.analityc.quartiles[2][attr];
            const left = q1 - (k*(q3 - q1));
            const right = q3 + (k*(q3 - q1));
            result = result.filter((item => item[attr] >= left && item[attr] <= right));
        })
        return result;
    }

    private countQuartile(data: IInstance[]): [IInstance, IInstance, IInstance] {
        const quartile1: IInstance = {};
        const quartile2: IInstance = {};
        const quartile3: IInstance = {};
        const isOddLenght = data.length % 2 !== 0;
        const half = Math.floor(data.length / 2);
        const mediana = (list: number[]) => list.length / 2 === 0 ? (list[list.length / 2] + list[(list.length / 2) - 1]) / 2 :
            list[Math.floor(list.length / 2)];
        this.attributes.forEach(attr => {
            const values = data.map(item => item[attr]).sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
            const part1 = values.slice(0, half + (isOddLenght ? 1 : 0));
            const part2 = values.slice(half);
            quartile1[attr] = mediana(part1);
            quartile2[attr] = mediana(values);
            quartile3[attr] = mediana(part2);
        })
        return [quartile1, quartile2, quartile3];
    }

    private average(instances: IInstance[]): IInstance {
        const result = {} as IInstance;
        this.attributes.forEach(attr => {
            let sum = 0;
            instances.forEach(item => sum += item[attr]);
            result[attr] = sum / instances.length;
        })
        return result;
    }
}

/*
*   IDEA FOR CENTROID
* first centroids style
*   3) Sort by most important atrribute and create centroids by part measures (new method)
* */


/*
* Idea of diffrent options objects
*
* */
