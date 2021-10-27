import {Query, Resolver, Mutation,Arg } from "type-graphql";
import { AuthenticationInfo } from "../entities/AuthenticationInfo";

@Resolver()
export class AuthenticationResolver {
    @Query(() => [AuthenticationInfo])
    async getUsers() {
        return AuthenticationInfo.find();
    }

    @Query(() => [AuthenticationInfo])
    async getUserByLogin(email: String, password: String) {
        return AuthenticationInfo.findOneOrFail({ where: { email:email, password:password }});
    }

    @Mutation(() => AuthenticationInfo)
    async createUser(
        @Arg("full_name", () => String) full_name: string,
        @Arg("username", () => String) username: string,
        @Arg("email", () => String) email: string,
        @Arg("password", () => String) password: string,
        @Arg("adminPassword", () => String) adminPassword: string,
        @Arg("isVerified", () => String) isVerified: string,
        @Arg("isAdmin", () => String) isAdmin: string,
        ) {
            const newUser = await AuthenticationInfo.insert({full_name,username,email,password,adminPassword,isVerified,
                isAdmin})
            return newUser;
        }
}

