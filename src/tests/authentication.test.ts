import {request} from 'graphql-request'
import { createConnection, getManager } from 'typeorm';
import { AuthenticationInfo } from '../entities/AuthenticationInfo';

const full_name = "full_name_test";
const username = "username_test"
const email = "test@test.com";
const password = "password_test";
const admin_password = "admin_password_test";
const is_verified = "is_verified_test";
const is_admin = "is_admin_test";

const createUserMutation = 
`mutation {createUser(full_name: "${full_name}", username: "${username}",email: "${email}", password: "${password}",admin_password: "${admin_password}", is_verified: "${is_verified}", is_admin: "${is_admin}")}`;

const getUsersQuery =
`query {getUsers{full_name,username,email,password,admin_password,is_verified,is_admin}}`;

const getUserByLogin =
`query {getUserByLogin(email:"test@test.com",password:"password_test"){full_name,username,email,password,admin_password,is_verified,is_admin}}`

test("Register User", async () => {
    const response = await request('http://localhost:4000/graphql',createUserMutation);
    expect(response).toEqual({createUser: true});
})

test("Get Users", async () => {
    await request('http://localhost:4000/graphql',getUsersQuery);
    await createConnection();
    const users = await AuthenticationInfo.find({where: {full_name: "full_name_test", username: "username_test",email: "test@test.com", password: "password_test",admin_password: "admin_password_test", is_verified: "is_verified_test", is_admin: "is_admin_test"}});
    expect(users).toHaveLength(1);
})

test("Get User by login", async () => {
    const response = await request('http://localhost:4000/graphql',getUserByLogin);
    expect(response).toEqual({"getUserByLogin": {"admin_password": "admin_password_test", "email": "test@test.com", "full_name": "full_name_test", "is_admin": "is_admin_test", "is_verified": "is_verified_test", "password": "password_test", "username": "username_test"}});
    const entityManager = getManager();
    entityManager.query(`DELETE FROM authentication_info WHERE full_name = "full_name_test" AND email = "test@test.com"`);
})

