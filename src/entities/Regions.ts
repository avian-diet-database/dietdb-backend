import { BaseEntity, Entity, PrimaryColumn } from "typeorm";

// Table containing acceptable regions
@Entity()
export class Regions extends BaseEntity {
    @PrimaryColumn()
    region_name: string;
}