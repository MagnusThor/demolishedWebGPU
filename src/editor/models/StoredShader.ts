import { IEntityBase, IOfflineEntity } from "../store/OfflineStorage";
export class StoredShader extends IEntityBase implements IOfflineEntity {

    thumbnail:string | undefined;

    constructor(public name: string, public description: string, public source: string) {
        super();
    }
  
}
