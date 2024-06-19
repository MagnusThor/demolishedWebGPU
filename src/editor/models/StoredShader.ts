import { IEntityBase, IOfflineEntity } from "../store/OfflineStorage";
export class StoredShader extends IEntityBase implements IOfflineEntity {

    thumbnail:string | undefined;   
    documents: IDocumentData[]

    constructor(public name: string, public description: string) {
        super();
        this.documents = new Array<IDocumentData>();
    }

    addDocument(name:string,source:string, type:TypeOfShader){

        this.documents.push({
            name: name,source:source, type:type
        });
        
    }
  
}

export enum TypeOfShader {
    MainFrag = "Main Fragment",
    Frag = "Fragment",
    Compute = "Compute",
  }

export interface IDocumentData {
    name: string;
    source: string;
    type: TypeOfShader
  }
