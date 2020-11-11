## Architecture Decision Records

### TypeScript
  
**Summary**

In order to use a programming language that defines different variable types, we decided to use TypeScript.

**Problem**

When a language doesn't define a specific type for its variables, it might be confusing for the user to know the exact state of that variable. It can be difficult to debug without knowing the type and state of an variable. 

**Constraints**

We want to use a frontend-focused language that all of us have had experience with, so we are comfortable from the beginning.

**Options**

JavaScript
- Pros: simple, popular so more documentation, client-side so less work is put on the servers
- Cons: types aren't defined so bugs are discovered at run time, different browsers will interpret code differently

TypeScript
- Pros: types are defined, additional features like interfaces and generics that don't exist in JavaScript, compile time type checking
- Cons: longer code when compared to JavaScript that might not add any clarity

**Rationale**

We chose TypeScript over JavaScript as our frontend language because we want to have our types clearly defined. Bugs will be discovered earlier at compile time rather than at run time. Also, the users will know the exact state of a variable rather than inferring it. 

### GraphQL

**Summary**

In order to create an organized API that works well with complex queries, we decided to use GraphQL.

**Problem**
The nature of the app requires querying a backend database with 5 or more potential parameters on any given query.

**Constraints**

None

**Options**

Rest API
- Pros: More common, other people may have an easier time integrating their own systems with our backend.
- Cons: As the queries rise in complexity, the request URLs may become unmanageable.

GraphQL
- Pro: Simplifies complex queries and return types.
- Con: More of a learning curve, potentially more trouble to set up in the backend.

**Rationale**

A REST API for this solution would look incredibly clunky: but given GraphQL's query and variable system, a clean solution is much easier. The simplicity gained outweighs the cost of initially learning it.

#### MySQL

**Summary**
In order to access the data provided by Prof. Hurlbert and his team in an efficient, reliable, and standardized way, we decided to use MySQL.

**Problem**

The backbone of the Avian Diet Database project a database that is currently  a tab deliminated text file. Prof. Hurlbert's current method of querying is a set of R functions that he wrote himself. This is hard to integrate cleanly with our chosen backend technology (GraphQL).

**Constraints**
Client prefers MySQL

**Options**

Flat Text File
- Pros: No need to use DBMS, no need to transform data to migrate to database (can reuse client logic in R functions)
- Cons: Have to parse file ourselves, still have to transform data to work with backend

A DBMS
- In terms of DBMS, any of the popular ones would work fine. The database is relatively flat and small so there is no huge benefit between them.
- Pros: Reliable, easily accessible, scalable
- Cons: Have to transfer current .txt format to a DBMS

**Rationale**

Since we decided to use GraphQL as the API to serve our data to the frontend, we can easily fit this with the data by using TypeORM with a database like MySQL.
Furthermore, using SQL to query the database rather than creating our own parser for a text file would be much more efficient in term of time and manpower.
We ultimately chose based on client preference.

#### Carolina Cloud Apps

**Summary**

In order for the frontend to access our APIs, we decided to use Carolina Cloud Apps to host the backend and database.

**Constraints**

Client prefers Carolina Cloud Apps

Database has 50,000+ records

Free is preferable

**Options**

Heroku
- Pros: Learned how to use in class, a lot of easily accessible documentation, straightforward to use.
- Cons: Free tier has limitation on memory.

Carolina Cloud Apps
- Pros: University supported so can get direct help from team running service, able to increase memory limit for free
- Cons: Documentation is a little hard to find, a bit more complicated to set up than other services, requires connection to UNC VPN

**Rationale**

Since the database contains over 50,000+ rows, it exceeds the free tier limit that Heroku provides. This is a similar issue for other services.
We decided to use Carolina Cloud Apps because Prof. Hurlbert is able to increase memory limits for the servers for free if needed.
Having the backend also in Carolina Cloud App allows easy interaction between it and the database.
Furthermore, client prefers Carolina Cloud App, since he is able to get direct assistance with University staff if any trouble is to occur.