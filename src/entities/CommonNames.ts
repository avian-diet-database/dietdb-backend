
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class CommonNames extends BaseEntity {
    @PrimaryColumn({ length: 100 })
    taxon: string;

    @PrimaryColumn({ length: 100 })
    taxonomic_rank: string;

    @PrimaryColumn({ length: 100 })
    prey_kingdom: string;

    @PrimaryColumn({ length: 50 })
    prey_stage: string;

    @Column()
    common_name: string;
}