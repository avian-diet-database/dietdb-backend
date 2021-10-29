import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class AuthenticationInfo extends BaseEntity {
    @PrimaryGeneratedColumn()
    unique_id: number;

    @Field()
    @Column()
    full_name: string;

    @Field()
    @Column()
    username: string;

    @Field()
    @Column()
    email: string;

    @Field()
    @Column()
    password: string;

    @Field()
    @Column()
    admin_password: string;

    @Field()
    @Column()
    is_verified: string;

    @Field()
    @Column()
    is_admin: string;
}