import {  Query, Resolver } from "type-graphql";

@Resolver()
export class AvianDietResolver {
    @Query(() => String)
    async hello() {
        return "hello world!";
    }
}