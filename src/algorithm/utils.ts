import {IAnalitycsObjects, ICluster, IInstance, IOptions, Quartiles} from "../Types";
import {Algorithm, IInstanceWithID} from "./algorithm";
import {DistanceMap} from "./distanceMap";

export class Utils {
    public static exampleMethod(): void {
        console.log('Hello world');
    }

    public static hasUndefined<T>(item: T): boolean {
        for (let itemKey in item) {
            if (!item[itemKey]) {
                return true;
            }
        }
        return false;
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

    public static filterUndefined(instances: IInstance[]): IInstance[] {
        return instances.filter(item => !Utils.hasUndefined(item));
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

    public static createClusters(instances: IInstance[], distanceGrid: DistanceMap, k: number): ICluster[] {
        const result: ICluster[] = [];
        let points: IInstanceWithID[] = instances.map((value: IInstance, index: number) => ({...value, _id: index}));
        const distanceMap: Map<[number, number], number> = new Map<[number, number], number>(distanceGrid.distanceMap);
        for (let i = 0; i < k; ++i) {
            const max = Utils.findMax(distanceMap);
            // max distance /2 ?
            const maxDistance = (max / k) / 2;
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
                if (nKeys.length < keys.length || nKeys.length === 0) {
                    newCentroid = point;
                    nKeys = keys;
                }
            });
            const newCluster: ICluster = {centroid: newCentroid as IInstance, objects: []};
            const pointsIds = nKeys.map(key => key[0] !== newCentroid._id ? key[0] : key[1]);
            console.log(pointsIds);
            for (const pointId in pointsIds) {
                if (!points.find(value => value._id === +pointId)) {
                    // console.log(points);
                    console.log(pointId);
                    console.log(pointsIds);
                    throw new Error("Dupa");
                }
                newCluster.objects.push({...points.find(value => value._id === +pointId)});
                points = points.filter(value => value._id !== +pointId);
            }
            points = points.filter(value => value._id !== newCentroid._id);
            console.log(distanceMap.size, '   ',nKeys.length);
            nKeys.forEach(key => distanceMap.delete(key));
            console.log(distanceMap.size, '   ',nKeys.length);
            result.push(newCluster);
        }
        return result;
    }

    public static findMax(map: Map<any, number>): number {
        let max = -1;
        map.forEach((value: number) => max = max < value ? value : max)
        return max;
    }
}
