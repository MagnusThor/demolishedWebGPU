
export interface IOfflineEntity {
    id: string
    created: number;
    lastModified: number
}


export class IEntityBase implements IOfflineEntity {
    id: string
    created: number;
    lastModified: number
    constructor(){
        this.id = crypto.randomUUID();
        this.created = Date.now();
        this.lastModified = Date.now();
    }
}



export interface IOfflineGraph<T>{
    label:string
    collection: Array<T>
   
}


export class OfflineStorage<T extends IEntityBase>  {
        model: IOfflineGraph<T>;

        constructor(public label:string){

        
       

        }



        private serialize():IOfflineGraph<T>{
            const data = localStorage.getItem(this.label);
            if(!data){
                 throw `no storage found for ${this.label}`; 
            }else{
                    const model = JSON.parse(data) as IOfflineGraph<T> 
                    this.model = model;
                    return model;
            }
        }
        private deSerialize():string{
            const data = JSON.stringify(this.model);
            return data;
        }

        save(){
            const data = this.deSerialize();
            localStorage.setItem(this.label,data);
            
        }

        getLocalStorage():IOfflineGraph<T>{
            return this.serialize();
        }
 
        insert(item: T): T {
            this.model.collection.push(item);         
            return item;
        }
    
        update(item: T): void {
            const index = this.model.collection.findIndex((pre) => pre.id === item.id);
            console.log(index);
            if (index !== -1) {
                item.lastModified = Date.now();
                this.model.collection[index] = item;
            }
        }
    
        delete(item: T): void {
            const index = this.model.collection.findIndex((pre) => pre.id === item.id);
            if (index !== -1) {
                this.model.collection.splice(index, 1);
            }
        }
    
        findById(uuid: string): T | undefined {
            return this.model.collection.find((pre) => pre.id === uuid) as T | undefined;
        }
    
        find(query: (shader: T) => boolean): Array<T> {
            return this.model.collection.filter(query) as Array<T>;
        }
    
        setup():IOfflineGraph<T>{   
              
                this.model = {label:this.label,collection:[]};
                return this.model;
        }

        init(): void{
               this.model =  this.getLocalStorage();
             
        }
}