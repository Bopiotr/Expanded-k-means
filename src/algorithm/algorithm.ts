import {IInstance, IImportedData, ICluster, IOptions, IAnalitycsObjects, IOutputData} from '../Types';
import {Random} from 'random-js';
import {euclideanDistance} from '../distanes/distancesFunctions';
import {Utils} from "./utils";

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
    public readonly data: IImportedData;
    public readonly instances: IInstance[];

    private iterations: number;
    private firstClusters: ICluster[];

    constructor(data: IImportedData, options?: IOptions) {
        console.log('Preprocesing.....');
        this.data = data;
        this.options = Utils.parseOptions(options);
        let filteredData: IInstance[] = data.instances;
        this.instances = [...filteredData];
        this.analityc = {
            quartiles: Utils.countQuartile(filteredData, this.data.attributes),
            average: Utils.average(filteredData, this.data.attributes)
        } as IAnalitycsObjects;
        this.instances = this.options.removeOutlier ? Utils.filterOutlier(filteredData, data.attributes, this.analityc.quartiles) : this.instances;
        this.analityc = Utils.pushMinMax(this.analityc, this.instances, this.data.attributes);
        this.instances = Utils.normalizeInstances(this.instances, this.options.standardScore, this.analityc);
        console.log('Preprocesing done!');
        console.log('Start building distance grid....');
        // errro if instances.lenght > 4990
        this.clusters = Utils.createClusters(this.instances, this.options.distanceFunction, this.options.numClusters);
        this.firstClusters = [...this.clusters];
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
            objectsLength: this.instances.length,
            firstClusters: this.firstClusters
        } as IOutputData;
    }

    public buildClusters(): void {
        if (this.options.random !== 'Dupa') {
            this.options.random === 'RandomValues' ? this.randomClusters() : this.assignRandomInstancesAsClusters();
        }
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
                this.data.attributes.forEach(attr => {
                    const sum: number = value.objects.map(item => item[attr])
                        .reduce((total: number, aNumber: number) => total + aNumber, 0);
                    newMid[attr] = sum / value.objects.length;
                    // idea: comparing by cluster objects
                    if ((!this.options.iterationLimit || iterator < this.options.iterationLimit)) {
                        continueIterations = continueIterations || (Math.abs(newMid[attr] - value.centroid[attr]) > 1);
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
            } as ICluster);
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
}

export interface IInstanceWithID extends IInstance {
    _id: number
}
