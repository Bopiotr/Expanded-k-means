import {IInstance, IImportedData, ICluster, IOptions} from '../Types';
import {Random} from 'random-js';
import {euclideanDistance} from '../distanes/distancesFunctions';

export class Algorithm {
    private static defaultOptions: IOptions = {
        numClusters: 4,
        distanceFunction: euclideanDistance,
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

    public buildClusters(): void {
        this.randomCentroids();
        let continueIterations = false;
        let iterator = 0;
        do {
            this.assignObjectsToClusters();
            continueIterations = false;
            ++iterator;
            this.clusters.forEach((value: ICluster, index: number) => {
                let newMid: IInstance = {};
                this.attributes.forEach(attr => {
                    const sum = value.objects.map(item => !(typeof item[attr] === 'string') ? item[attr] : +item[attr])
                        .reduce((total, aNumber) => total + aNumber, 0);
                    newMid[attr] = sum / value.objects.length;
                    if (!this.options.iterationLimit || iterator < this.options.iterationLimit) {
                        continueIterations = newMid[attr] !== value.centroid[attr];
                    }
                })
                this.clusters[index] = {
                    ...value,
                    centroid: !value.objects.length ? this.clusters[index].centroid : newMid
                } as ICluster;
            });
        } while (continueIterations);
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

    private assignObjectsToClusters(): void {
        if (!this.options.distanceFunction) {
            throw new Error('Distance function is undefined');
        }
        const newClusters: ICluster[] = this.clusters.map(value => ({
            centroid: value.centroid,
            objects: []
        } as ICluster));

        this.instances.forEach((currentInstance: IInstance) => {
            let nearestCent: { centroidIndex: number, distance: number } = {
                centroidIndex: 0,
                distance: this.options.distanceFunction(currentInstance, this.clusters[0].centroid, this.attributes)
            };
            this.clusters.forEach((currentCluster: ICluster, clusterIndex: number) => {
                const distance: number = this.options.distanceFunction(currentInstance, currentCluster.centroid, this.attributes);
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

















