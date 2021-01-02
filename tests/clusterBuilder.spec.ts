import {ClusterBuilder} from "../src/algorithm/clusterBuilder";
import {pointsDistance} from "../src/distanes/distancesFunctions";
import {IInstance} from "../src/Types";
import {Random} from "random-js";

const instances = [
    {x: 0, y: 6},
    {x: 4, y: 15},
    {x: 14, y: 3},
    {x: 19, y: 2},
    {x: 7, y: 20},
    {x: 2, y: 1},
];

const createPoints = (): IInstance[] => {
    const result = [];
    for (let i = 0; i < 1000; ++i) {
        const x = new Random().real(1, 1000);
        const y = new Random().real(1, 1000);
        result.push({x: x, y: y} as IInstance);
    }
    return result;
}

describe('clusterBuilder', function () {
   it('build map', function () {
       const builder = new ClusterBuilder();
       builder.build(instances, pointsDistance);
       expect(builder.points.length).toBe(instances.length);
       expect(builder.distanceMap.size).toBe(15);
   })

   it('build big map', function () {
       const builder = new ClusterBuilder();
       const testInstances = createPoints();
       builder.build(testInstances, pointsDistance);
       expect(builder.points.length).toBe(testInstances.length);
       expect(builder.distanceMap.size).toBe(499500);
   })

   it('delete one point', function () {
       const builder = new ClusterBuilder();
       builder.build(instances, pointsDistance);
       const idToDelete = 2;
       builder.deleteById(idToDelete);
       expect(!builder.getPoint(idToDelete)).toBe(true);
       builder.distanceMap.forEach((value, key) => {
           expect(key[0] !== idToDelete && key[1] !== idToDelete).toBe(true);
       })
   })

    it('delete one point, big', function () {
        const builder = new ClusterBuilder();
        const testInstances = createPoints();
        builder.build(testInstances, pointsDistance);
        const idToDelete = 2;
        builder.deleteById(idToDelete);
        expect(!builder.getPoint(idToDelete)).toBe(true);
        builder.distanceMap.forEach((value, key) => {
            expect(key[0] !== idToDelete && key[1] !== idToDelete).toBe(true);
        })
    })

    it('delete points', function () {
        const builder = new ClusterBuilder();
        builder.build(instances, pointsDistance);
        const idsToDelete = [2, 3, 4];
        builder.deleteById(idsToDelete);
        idsToDelete.forEach(id => expect(!builder.getPoint(id)).toBe(true))
        builder.distanceMap.forEach((value, key) => {
            expect(!idsToDelete.includes(key[0]) && !idsToDelete.includes(key[1])).toBe(true);
        })
    })

    it('delete points, big', function () {
        const builder = new ClusterBuilder();
        const testInstances = createPoints();
        builder.build(testInstances, pointsDistance);
        const idsToDelete = [2, 3, 4];
        builder.deleteById(idsToDelete);
        idsToDelete.forEach(id => expect(!builder.getPoint(id)).toBe(true))
        builder.distanceMap.forEach((value, key) => {
            expect(!idsToDelete.includes(key[0]) && !idsToDelete.includes(key[1])).toBe(true);
        })
    })


});
