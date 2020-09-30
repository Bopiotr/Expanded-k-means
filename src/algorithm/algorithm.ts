import {IInstance, IImportedData, ICluster, IOptions, IAnalitycsObjects} from '../Types';
import {Random} from 'random-js';
import {euclideanDistance} from '../distanes/distancesFunctions';

export class Algorithm {
    private static defaultOptions: IOptions = {
        numClusters: 4,
        distanceFunction: euclideanDistance,
        standardScore: false
    } as IOptions;

    public attributes: string[];
    public clusters: ICluster[];
    public options: IOptions;
    public analityc: IAnalitycsObjects;
    public readonly instances: IInstance[];
    public readonly copyInstances: IInstance[];

    constructor(data: IImportedData, options?: IOptions) {
        this.attributes = data.attributes;
        this.options = options || Algorithm.defaultOptions;
        const filteredData = data.instances.filter(item => !this.hasUndefined(item));
        this.analityc = {...this.countMinAndMaxValues(filteredData)};
        if (!this.options.standardScore) {
            this.instances = filteredData;
        } else {
            this.copyInstances = {...filteredData};
            this.instances = this.normalizeInstances(filteredData);
        }
    }

    public buildClusters(): void {
        this.randomCentroids();
        let continueIterations = false;
        let iterator = 0;
        do {
            if (this.options.reRandomCentroidAfterIterations && (iterator % this.options.reRandomCentroidAfterIterations === 0)) {
                this.randomCentroids();
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
                    if (!this.options.iterationLimit || iterator < this.options.iterationLimit) {
                        continueIterations = newMid[attr] !== value.centroid[attr];
                    }
                });
                this.clusters[index] = {
                    ...value,
                    centroid: !value.objects.length ? this.clusters[index].centroid : newMid
                } as ICluster;
            });
            console.clear();
            console.log('Iteration counter: ', iterator);
        } while (continueIterations);
    }

    private countMinAndMaxValues(instances: IInstance[]): IAnalitycsObjects {
        const minValuesInstance: IInstance = {...instances[0]};
        const maxValuesInstance: IInstance = {...instances[0]};
        this.attributes.forEach((attr: string) => {
            instances.forEach((inst: IInstance) => {
                maxValuesInstance[attr] = +inst[attr] < +maxValuesInstance[attr] ? inst[attr] : maxValuesInstance[attr];
                minValuesInstance[attr] = +inst[attr] > +minValuesInstance[attr] ? inst[attr] : minValuesInstance[attr];
            })
        });
        return {
            minValues: minValuesInstance,
            maxValues: maxValuesInstance
        } as IAnalitycsObjects;
    }

    private randomCentroids(): void {
        this.clusters = [];
        const minVal = this.options.standardScore && this.options.standardScore[0];
        const maxVal = this.options.standardScore && this.options.standardScore[1];
        const random: Random = new Random();
        for (let i = 0; i < this.options.numClusters; ++i) {
            const centroid: IInstance = {};
            this.attributes.forEach((attr: string) => {
                centroid[attr] = random.real(minVal || this.analityc.minValues[attr], maxVal || this.analityc.maxValues[attr]);
            });
            this.clusters.push({centroid: centroid, objects: []} as ICluster);
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
            for (let x in currentInstance) {
                if (!currentInstance[x]) {
                    return;
                }
            }
            let nearestCent: { centroidIndex: number, distance: number } = {
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
        this.clusters = [...newClusters];
    }

    private normalizeInstances(instances: IInstance[]): IInstance[] {
        if (!instances || !instances.length) {
            return [];
        }
        const [c, d]: [number, number] = this.options.standardScore as [number, number];
        const result: IInstance[] = instances.map((item: IInstance) => {
            const newItem: IInstance = {};
            for (let attr in item) {
                const [a, b] = [this.analityc.minValues[attr], this.analityc.maxValues[attr]];
                newItem[attr] = (d - c)/(b - a) * (item[attr] - a) + c;
            }
            console.log(newItem);
            return newItem;
        });

        return result;
    }

    private hasUndefined(item: any): boolean {
        for (let itemKey in item) {
            if (!item[itemKey]) {
                return true;
            }
        }
        return false;
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

















