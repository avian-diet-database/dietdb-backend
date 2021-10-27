import {Query, Resolver, Mutation,Arg, ArgsType, Field, Args } from "type-graphql";
import { AuthenticationInfo } from "../entities/AuthenticationInfo";

@ArgsType()
class GetUserByLoginArgs {
    @Field()
    email: string;

    @Field()
    password: string;
}

@Resolver()
export class AuthenticationResolver {
    @Query(() => [AuthenticationInfo])
    async getUsers() {
        return AuthenticationInfo.find();
    }

    @Query(() => AuthenticationInfo)
    async getUserByLogin(@Args() {email, password}: GetUserByLoginArgs) {
        return AuthenticationInfo.findOneOrFail({ where: { email:email, password:password }});
    }

    @Mutation(() => Boolean)
    async createUser(
        @Arg("full_name", () => String) full_name: string,
        @Arg("username", () => String) username: string,
        @Arg("email", () => String) email: string,
        @Arg("password", () => String) password: string,
        @Arg("adminPassword", () => String) adminPassword: string,
        @Arg("isVerified", () => String) isVerified: string,
        @Arg("isAdmin", () => String) isAdmin: string,
        ) {
            await AuthenticationInfo.insert({full_name,username,email,password,adminPassword,isVerified,
                isAdmin})
            return true;
        }
}

