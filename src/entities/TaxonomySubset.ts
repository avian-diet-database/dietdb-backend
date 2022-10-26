import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@ObjectType()
@Entity()
export class TaxonomySubset extends BaseEntity {

    @Field()
    @PrimaryColumn()
    taxon_order: number;

    @Field()
    @Column()
    primary_com_name: string;

    @Field()
    @Column()
    sci_name: string;

    @Field()
    @Column()
    family: string;
}