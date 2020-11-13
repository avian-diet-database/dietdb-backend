import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class TableHistory extends BaseEntity {
    @PrimaryColumn()
    table_name: string;

    @Column()
    last_updated: string;
}