export class Instances {

    public attributes: string[] = [];
    public instances: IInstance[] = [];

    constructor() {
        this.attributes = [];
        this.instances = [];
    }
}

export interface IInstance {
    [key: string]: string | number
}
