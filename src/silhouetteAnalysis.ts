import {ICluster, IInstance} from "./Types";
import {DistanceFunctionType} from "./distanes/distancesFunctions";

export type SilhouetteCoefficients = number[][];

export const countSilhouette = (clusters: ICluster[], distance: DistanceFunctionType): [SilhouetteCoefficients, number] => {
  const result: SilhouetteCoefficients = [];
  let sum = 0;
  let lenght = 0;
  clusters.forEach(({objects}: {objects: IInstance[]}, index: number) => {
    result[index] = [];
    for (let i = 0; i < objects.length; i++) {
      const ai = countA(clusters, distance, index, i);
      const otherClusters = clusters.filter((val, cluIndex) => cluIndex !== index);
      const currentObject = clusters[index].objects[i];
      const bi = countB(otherClusters, currentObject, distance);
      result[index][i] = (bi - ai) / (bi > ai ? bi : ai);
      sum += result[index][i];
      ++lenght;
    }
  })
  return [result, (sum/lenght)];
};

export const countA = (clusters: ICluster[], distance: DistanceFunctionType, cluIndex: number, i: number): number => {
  const currentObj: IInstance = clusters[cluIndex].objects[i];
  const sum = clusters[cluIndex].objects
      .reduce((total:number, object: IInstance, index: number) =>
          index === i ? total : total + distance(object, currentObj), 0);

  return sum / (clusters[cluIndex].objects.length - 1);
}

export const countB = (centroids: ICluster[], object: IInstance, distance: DistanceFunctionType): number => {
  const avargeDistance = (objects: IInstance[]) => {
    if (objects.length === 0) {
      return 0;
    }
    const sum = objects.reduce((total, dupa) => total + distance(dupa, object), 0);
    return sum / objects.length;
  };
  let k = 0;
  let result: number = avargeDistance(centroids[k++].objects);
  for (k; k < centroids.length; ++k) {
    const av = avargeDistance(centroids[k].objects);
    result = result > av ? av : result;
  }
  return result;
}