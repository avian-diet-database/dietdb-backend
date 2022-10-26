import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

// Used for fast autocomplete
@ObjectType()
@Entity()
export class PreyNames extends BaseEntity {

    @Field()
    @PrimaryColumn()
    name: string;

    @Field()
    @Column()
    is_common_name: boolean;
}