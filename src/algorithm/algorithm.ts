import {IInstance, IImportedData, ICluster, IOptions, IAnalitycsObjects, IOutputData} from '../Types';
import {Random} from 'random-js';
import {DistanceFunctionType, euclideanDistance} from '../distanes/distancesFunctions';

export class Algorithm {
    public static defaultOptions: IOptions = {
        numClusters: 4,
        distanceFunction: euclideanDistance,
        removeOutlier: true,
        random: "RandomInstances",
        standardScore: [0, 100]
    } as IOptions;

    public clusters: ICluster[];
    public options: IOptions;
    public analityc: IAnalitycsObjects;
    public distanceGrid: Map<[number, number], number>;
    public readonly data: IImportedData;
    public readonly instances: IInstance[];

    private iterations: number;

    constructor(data: IImportedData, options?: IOptions) {
        console.log('Preprocesing.....');
        this.data = data;
        this.options = this.parseOptions(options);
        let filteredData = this.filterUndefined(data.instances);
        this.instances = this.filterUndefined(data.instances);
        this.analityc = {
            quartiles: this.countQuartile(filteredData),
            average: this.average(filteredData)
        } as IAnalitycsObjects;
        this.instances = this.options.removeOutlier ? this.filterOutlier(filteredData) : this.instances;
        this.analityc = this.pushMinMax(this.analityc, this.instances);
        this.instances = this.normalizeInstances(this.instances, this.options.standardScore, this.analityc);
        console.log('Preprocesing done!');
        console.log('Start building distance grid....');
        // errro if instances.lenght > 4990
        this.distanceGrid = this.buildDistanceGrid(this.instances, this.options.distanceFunction);
        // console.log(this.distanceGrid);
        console.log('Creating clusters...');
        this.clusters = this.createClusters(this.instances, this.distanceGrid, this.options.numClusters);
        console.log(this.clusters);
    }

    private parseOptions(options?: IOptions): IOptions {
        return !options ? Algorithm.defaultOptions : {
            numClusters: options.numClusters || Algorithm.defaultOptions.numClusters,
            iterationLimit: options.iterationLimit != null ? options.iterationLimit : Algorithm.defaultOptions.iterationLimit,
            removeOutlier: options.removeOutlier === false ? false : Algorithm.defaultOptions.removeOutlier,
            standardScore: options.standardScore || Algorithm.defaultOptions.standardScore,
            random: options.random || Algorithm.defaultOptions.random,
            distanceFunction: options.distanceFunction || Algorithm.defaultOptions.distanceFunction
        } as IOptions;
    }

    private filterUndefined(instances: IInstance[]): IInstance[] {
        return instances.filter(item => !this.hasUndefined(item));
    }

    public get outputData(): IOutputData {
        if (!this.clusters || !this.clusters.length) {
            return null;
        }
        return {
            values: this.data.instances,
            normalizeValues: this.instances,
            options: this.options,
            clusters: this.clusters,
            statistics: this.analityc,
            attributes: this.data.attributes,
            iterations: this.iterations || -1,
            objectsLength: this.instances.length
        } as IOutputData;
    }

    public buildClusters(): void {
        if (this.options.random !== 'Dupa') {
            this.options.random === 'RandomValues' ? this.randomClusters() : this.assignRandomInstancesAsClusters();
        }
        let continueIterations = false;
        let dupa = false;
        let iterator = 0;
        do {
            if (this.options.reRandomCentroidAfterIterations && (iterator % this.options.reRandomCentroidAfterIterations === 0)) {
                this.options.random === 'RandomValues' ? this.randomClusters() : this.assignRandomInstancesAsClusters();
            }
            if (dupa) {
                this.assignObjectsToClusters();
            }
            dupa = true;
            continueIterations = false;
            ++iterator;
            this.clusters.forEach((value: ICluster, index: number) => {
                let newMid: IInstance = {};
                this.data.attributes.forEach(attr => {
                    const sum: number = value.objects.map(item => item[attr])
                        .reduce((total: number, aNumber: number) => total + aNumber, 0);
                    newMid[attr] = sum / value.objects.length;
                    // idea: comparing by cluster objects
                    if ((!this.options.iterationLimit || iterator < this.options.iterationLimit)) {
                        continueIterations = continueIterations || (Math.abs(newMid[attr] - value.centroid[attr]) > 0.001);
                    }
                });
                this.clusters[index] = {
                    ...value,
                    centroid: !value.objects.length ? this.clusters[index].centroid : newMid
                } as ICluster;
            });
            // console.clear();
            // console.log(iterator);
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
        this.data.attributes.forEach((attr: string) => {
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
            this.data.attributes.forEach((attr: string) => {
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

    private normalizeInstances(instances: IInstance[], standardScope: [number, number], analytic: IAnalitycsObjects): IInstance[] {
        if (!standardScope) {
            throw Error('Standard Score not provided');
        } else if (!instances || !instances.length) {
            return [];
        }
        const [a, b]: [number, number] = standardScope;
        return instances.map((item: IInstance) => {
            const newItem: IInstance = {};
            for (let attr in item) {
                const min = analytic.minValues[attr];
                const max = analytic.maxValues[attr];
                newItem[attr] = (b - a) / (max - min) * (item[attr] - min) + a;
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
        this.data.attributes.forEach(attr => {
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
        this.data.attributes.forEach(attr => {
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
        this.data.attributes.forEach(attr => {
            let sum = 0;
            instances.forEach(item => sum += item[attr]);
            result[attr] = sum / instances.length;
        })
        return result;
    }

    private pushMinMax(analityc: IAnalitycsObjects, instances: IInstance[]) {
        return {
            ...analityc,
            ...this.countMinAndMaxValues(instances)
        } as IAnalitycsObjects;
    }

    private buildDistanceGrid(instances: IInstance[], distanceFunction: DistanceFunctionType): Map<[number, number], number> {
        const result = new Map<[number, number], number>();
        for (let indexA = 0; indexA < instances.length; ++indexA) {
            for (let indexB = indexA + 1; indexB < instances.length; ++indexB) {
                const distanceAB: number = distanceFunction(instances[indexA], instances[indexB]);
                result.set([indexA, indexB], distanceAB);
            }
        }
        return result;
    }

    private createClusters(instances: IInstance[], distanceGrid: Map<[number, number], number>, k: number): ICluster[] {
        const result: ICluster[] = [];
        let points: IInstanceWithID[] = instances.map((value: IInstance, index: number) => ({...value, _id: index}));
        const distanceMap: Map<[number, number], number> = new Map<[number, number], number>(distanceGrid);
        for (let i = 0; i < k; ++i) {
            const max = this.findMax(distanceMap) / 2;
            // max distance /2 ?
            const maxDistance = max/k;
            let newCentroid: IInstanceWithID = {} as IInstanceWithID;
            let nKeys: [number, number][] = [];
            points.forEach((point: IInstanceWithID) => {
                let keys: [number, number][] = [];
                for (const key of distanceMap.keys()) {
                    const [a, b] = key;
                    if (a === point._id || b === point._id) {
                        keys.push(key);
                    }
                }
                keys = keys.filter(key => maxDistance > distanceMap.get(key));
                if (nKeys.length < keys.length) {
                    newCentroid = point;
                    nKeys = keys;
                }
            });
            const newCluster: ICluster = {centroid: newCentroid as IInstance, objects: []};
            for (const pointId in nKeys.map(key => key[0] !== newCentroid._id ? key[0] : key[1])) {
                newCluster.objects.push({...points.find(value => value._id === +pointId)} as IInstance);
                points = points.filter(value => value._id !== +pointId);
            }
            points = points.filter(value => value._id !== newCentroid._id);
            nKeys.forEach(key => distanceMap.delete(key));
            result.push(newCluster);
        }
        return result;
    }

    private findMax(map: Map<any, number>): number {
        let max = -1;
        map.forEach((value: number) => max = max < value ? value : max)
        return max;
    }
}

interface IInstanceWithID extends IInstance {
    _id: number
}
