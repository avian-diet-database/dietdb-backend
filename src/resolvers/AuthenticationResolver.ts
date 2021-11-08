import {Query, Resolver, Mutation,Arg, ArgsType, Field, Args } from "type-graphql";
import { AuthenticationInfo } from "../entities/AuthenticationInfo";

@ArgsType()
class GetUserByEmailArgs {
    @Field()
    email: string;
}

@Resolver()
export class AuthenticationResolver {
    @Query(() => [AuthenticationInfo])
    async getUsers() {
        return AuthenticationInfo.find();
    }

    @Query(() => AuthenticationInfo)
    async getUserByEmail(@Args() {email}: GetUserByEmailArgs) {
        return AuthenticationInfo.findOneOrFail({ where: { email:email }});
    }

    @Mutation(() => Boolean)
    async createUser(
        @Arg("full_name", () => String) full_name: string,
        @Arg("username", () => String) username: string,
        @Arg("email", () => String) email: string,
        @Arg("password", () => String) password: string,
        @Arg("admin_password", () => String) admin_password: string,
        @Arg("is_verified", () => String) is_verified: string,
        @Arg("is_admin", () => String) is_admin: string,
        ) {
            await AuthenticationInfo.insert({full_name,username,email,password,admin_password,is_verified,
                is_admin})
            return true;
        }
}

