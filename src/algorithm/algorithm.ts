import {IInstance, IImportedData, ICluster, IOptions, IAnalitycsObjects, IOutputData, IInstanceWithID} from '../Types';
import {Random} from 'random-js';
import {defaultDistance} from '../distanes/distancesFunctions';
import {Utils} from "./utils";

export class Algorithm {
    public static defaultOptions: IOptions = {
        numClusters: 4,
        distanceFunction: defaultDistance,
        removeOutlier: true,
        random: "RandomInstances",
        standardScore: [0, 80]
    } as IOptions;

    public clusters: ICluster[];
    public options: IOptions;
    public analityc: IAnalitycsObjects;
    public readonly data: IImportedData;
    public readonly instancesWithId: IInstanceWithID[];
    public readonly instances: IInstance[];

    private iterations: number;
    private firstClusters: ICluster[];

    constructor(data: IImportedData, options?: IOptions) {
        console.log('Preprocesing.....');
        this.data = data;
        this.options = Utils.parseOptions(options);
        let filteredData: IInstance[] = data.instances.filter(Utils.hasUndefined);
        this.instances = [...filteredData];
        this.analityc = {
            quartiles: Utils.countQuartile(filteredData, this.data.attributes),
            average: Utils.average(filteredData, this.data.attributes)
        } as IAnalitycsObjects;
        this.instances = this.options.removeOutlier ? Utils.filterOutlier(filteredData, data.attributes, this.analityc.quartiles) : this.instances;
        this.analityc = Utils.pushMinMax(this.analityc, this.instances, this.data.attributes);
        this.instances = Utils.normalizeInstances(this.instances, this.options.standardScore, this.analityc);
        if (this.options.random === 'CountClusters') {
            console.log('Preprocesing done!');
            console.log('Start building distance grid....');
            // errro if instances.lenght > 4990
            this.clusters = Utils.createClusters(this.instances, this.options.distanceFunction, this.options.numClusters);
            this.firstClusters = [...this.clusters];
        }
        this.instancesWithId = this.instances.map((item, index) => ({...item, __id: index} as IInstanceWithID));
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
        switch (this.options.random) {
            case "CountClusters":
                break;
            case "RandomInstances":
                this.assignRandomInstancesAsClusters();
                break;
            case "RandomValues":
                this.randomClusters();
                break;
            default:
                throw new Error("Random Style not provided");
        }
        let continueIterations = false;
        let iterator = 0;
        this.assignObjectsToClusters();
        do {
            continueIterations = false;
            ++iterator;
            const newCentroids: IInstance[] = [];
            this.clusters.forEach((currentCluster: ICluster, index: number) => {
                let newMid: IInstance = {};
                this.data.attributes.forEach(attr => {
                    const sum: number = currentCluster.objects.map(item => item[attr])
                        .reduce((total: number, aNumber: number) => total + aNumber, 0);
                    newMid[attr] = sum / currentCluster.objects.length;
                });
                newCentroids[index] = !currentCluster.objects.length ? this.clusters[index].centroid : newMid;
            });
            const newClusters: ICluster[] = this.assignObjectsToClusters2(newCentroids);
            continueIterations = this.continueIterations(this.clusters, newClusters);
            this.clusters = newClusters;
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
                centroid: {...this.instancesWithId[random.integer(0, this.instancesWithId.length)]},
                objects: []
            } as ICluster);
        }
    }

    private assignObjectsToClusters(): void {
        const newClusters: ICluster[] = this.clusters.map(value => ({
            centroid: value.centroid,
            objects: []
        } as ICluster));

        this.instancesWithId.forEach((currentInstance: IInstanceWithID) => {
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

    private assignObjectsToClusters2(centroids: IInstance[]): ICluster[] {
        const newClusters: ICluster[] = centroids.map(value => ({
            centroid: value,
            objects: []
        } as ICluster));

        this.instancesWithId.forEach((currentInstance: IInstanceWithID) => {
            let nearestCent = {
                centroidIndex: 0,
                distance: this.options.distanceFunction(currentInstance, this.clusters[0].centroid)
            };
            newClusters.forEach((currentCluster: ICluster, clusterIndex: number) => {
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
        return newClusters;
    }

    private continueIterations(oldClusters: ICluster[], newClusters: ICluster[]): boolean {
        for(let i = 0; i < this.options.numClusters; ++i) {
            const newObj = newClusters[i].objects.map(val => val.__id);
            const oldObj = oldClusters[i].objects.map(val => val.__id);
            if (newObj.length !== oldObj.length) return true;
            for(let j = 0; j < newObj.length; ++j) {
                if (!oldObj.includes(newObj[j])) return true;
            }
        }
        return false;
    }
}
