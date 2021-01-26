import {IAnalitycsObjects, ICluster, IInstance, IInstanceWithID, IOptions, Quartiles} from "../Types";
import {Algorithm} from "./algorithm";
import {ClusterBuilder} from "./clusterBuilder";
import {DistanceFunctionType} from "../distanes/distancesFunctions";

export class Utils {

    public static hasUndefined<T>(item: T): boolean {
        for (let itemKey in item) {
            if (item[itemKey] === undefined || item[itemKey] === null) {
                return false;
            }
        }
        return true;
    }

    public static parseOptions(options?: IOptions): IOptions {
        return !options ? Algorithm.defaultOptions : {
            numClusters: options.numClusters || Algorithm.defaultOptions.numClusters,
            iterationLimit: options.iterationLimit != null ? options.iterationLimit : Algorithm.defaultOptions.iterationLimit,
            removeOutlier: options.removeOutlier === false ? false : Algorithm.defaultOptions.removeOutlier,
            standardScore: options.standardScore || Algorithm.defaultOptions.standardScore,
            random: options.random || Algorithm.defaultOptions.random,
            distanceFunction: options.distanceFunction || Algorithm.defaultOptions.distanceFunction
        } as IOptions;
    }

    public static countQuartile(data: IInstance[], attributes: string[]): [IInstance, IInstance, IInstance] {
        const quartile1: IInstance = {};
        const quartile2: IInstance = {};
        const quartile3: IInstance = {};
        const isOddLenght = data.length % 2 !== 0;
        const half = Math.floor(data.length / 2);
        const mediana = (list: number[]) => list.length / 2 === 0 ? (list[list.length / 2] + list[(list.length / 2) - 1]) / 2 :
            list[Math.floor(list.length / 2)];
        attributes.forEach(attr => {
            const values = data.map(item => item[attr]).sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
            const part1 = values.slice(0, half + (isOddLenght ? 1 : 0));
            const part2 = values.slice(half);
            quartile1[attr] = mediana(part1);
            quartile2[attr] = mediana(values);
            quartile3[attr] = mediana(part2);
        })
        return [quartile1, quartile2, quartile3];
    }

    public static pushMinMax(analityc: IAnalitycsObjects, instances: IInstance[], attributes: string[]) {
        return {
            ...analityc,
            ...Utils.countMinAndMaxValues(instances, attributes)
        } as IAnalitycsObjects;
    }

    public static countMinAndMaxValues(instances: IInstance[], attributes: string[]): IAnalitycsObjects {
        if (!instances || !instances.length) {
            return {
                minValues: {},
                maxValues: {}
            } as IAnalitycsObjects;
        }
        const minValuesInstance: IInstance = {...instances[0]};
        const maxValuesInstance: IInstance = {...instances[0]};
        attributes.forEach((attr: string) => {
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

    public static filterOutlier(data: IInstance[], attributes: string[], qua: Quartiles, k: number = 1.5): IInstance[] {
        let result = [...data];
        attributes.forEach(attr => {
            const q1 = qua[0][attr];
            const q3 = qua[2][attr];
            const left = q1 - (k * (q3 - q1));
            const right = q3 + (k * (q3 - q1));
            result = result.filter((item => item[attr] >= left && item[attr] <= right));
        })
        return result;
    }

    public static average(instances: IInstance[], attributes: string[]): IInstance {
        const result = {} as IInstance;
        attributes.forEach(attr => {
            let sum = 0;
            instances.forEach(item => sum += item[attr]);
            result[attr] = sum / instances.length;
        })
        return result;
    }

    public static normalizeInstances(instances: IInstance[], standardScope: [number, number], analytic: IAnalitycsObjects): IInstance[] {
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

    public static createClusters(instances: IInstance[], distanceFunction: DistanceFunctionType, k: number): ICluster[] {
        const result: ICluster[] = [];
        const builder = new ClusterBuilder();
        builder.build(instances, distanceFunction);
        console.log(instances);
        for (let i = 0; i < k; ++i) {
            let newCentroid: IInstanceWithID = {} as IInstanceWithID;
            let nKeys: [number, number][] = [];
            builder.points.forEach((point: IInstanceWithID) => {
                console.clear()
                console.log('k: ' + i + ' point: ' + point._id);
                const maxDistance = builder.maxDistance(k);
                const keys = builder.getPointKeys(point._id).filter(key => {
                    const dupa = builder.distanceMap.get(key);
                    const result = maxDistance > dupa;
                    return result;
                });
                if (nKeys.length < keys.length || nKeys.length === 0) {
                    newCentroid = point;
                    nKeys = keys;
                }
            });
            const newCluster: ICluster = {centroid: newCentroid as IInstance, objects: []};
            const pointsIds = nKeys.map(key => key[0] !== newCentroid._id ? key[0] : key[1]);
            if (!pointsIds.length) {
                builder.deleteById(newCentroid._id);
                result.push(newCluster);
                continue;
            }
            for (const pointId of pointsIds) {
                console.clear()
                console.log('k: ' + i + ' point to add: ' + pointId);
                newCluster.objects.push({...builder.getPoint(+pointId)});
            }
            console.clear();
            console.log('Deleting...');
            if (i !== (k-1)) {
                builder.deleteById([...pointsIds, newCentroid._id]);
            }
            result.push(newCluster);
        }
        return result;
    }
}
