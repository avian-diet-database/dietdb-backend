import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

// Used for fast autocomplete
@Entity()
export class PreyNames extends BaseEntity {
    @PrimaryColumn()
    name: string;

    @Column()
    is_common_name: boolean;
}