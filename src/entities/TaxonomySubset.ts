import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class TaxonomySubset extends BaseEntity {
    @PrimaryColumn()
    taxon_order: number;

    @Column()
    primary_com_name: string;

    @Column()
    sci_name: string;

    @Column()
    family: string;
}