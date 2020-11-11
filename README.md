# Avian Diet Database Backend
A GraphQL server for serving data to the Avian Diet Database web page https://github.com/COMP523FA2020/Frontend
Types of data served includes:
- Diet breakdown for specific birds
- Predator breakdown for specific bird prey
- Data for graphs on web page
- Database stats for webpage

Data sourced from https://github.com/hurlbertlab/dietdatabase and https://github.com/ahhurlbert/aviandietdb
- This project will create the MySQL table in a database (via TypeORM migration), but does **not** come with actual data

# Getting Started

### Prerequisite 
- [git](https://git-scm.com/downloads)
  - not necessary, just to clone project if wanting to
- [node](https://nodejs.org/en/)
- [MySQL](https://www.mysql.com/downloads/)
  - If wanting to run locally, otherwise can use database set up somewhere else

### Installation
1. clone repo
```
git clone git@github.com:COMP523FA2020/Backend.git
```
2. run npm in project directory to install libraries
```
npm install
```

### Running Locally
1. Start up MySQL
 - There are several ways to start up the local MySQL server, and can vary by OS. Please read the MySQL docs for information relevant to you https://dev.mysql.com/
3. Create a database if there is not on already set up. Follow the MySQL docs.
4. Copy `.env.example` as `.env` in the same directory and set the variables. More information about each environmental variable [here](https://github.com/typeorm/typeorm/blob/master/docs/using-ormconfig.md#using-environment-variables)
5. Run using one of the scripts below on the command line within the project directory.

#### npm run devJS

Start a node development server which watches the dist folder for changes. 

#### npm run devTS

Start a node development server which watches the src folder for changes.

#### npm run startJS

Start a node server from dist/index.js without watching for changes. 

#### npm run startTS

Start a node server from src/index.ts without watching for changes. 

#### npm run watch

Start a tsc server which watches the src folder and compiles to the dist folder. 

#### Recommended: 
1. npm run watch
2. in another terminal, npm run devJS

## Warranty

Instructions above last tested and verified to work by https://github.com/Thomas-Le on November 11, 2020 on Windows 10

# Testing
To run testing suite, run the following command within the project directory:
```
npm run test
```

# Deployment
Production is run on the https://cloudapps.unc.edu/ platform. Requires UNC credentials to login.

To get more information about accessing, please contact https://bio.unc.edu/faculty-profile/hurlbert/.

The fully deployed project is connected to a MySQL database, which is also hosted and ran on CarolinaCloudApps.

#### Continuous Integration/Continuous Deployment
Any changes to the main branch on this repo will trigger a build and redeployment on the platform and production will be updated.

There is currently no automated testing during.

# Technologies Used
- GraphQL (TypeGraphQL)
- TypeORM
- Jest
- MySQL

Project ADR under (ADR.md)[https://github.com/COMP523FA2020/Backend/blob/master/ADR.md] in project root directory.

# Contributing
Please contact https://bio.unc.edu/faculty-profile/hurlbert/ before attempting to contribute

After gaining permission, will need to be added to https://github.com/COMP523FA2020 with proper permissions to commit code.

Will also need access to project on https://cloudapps.unc.edu/ to view status of deployment or modify settings.

For more information about the original team and project information, visit https://comp523fa2020.github.io/Overview/

# Authors
#### Frontend
- https://github.com/muyanpan
- https://github.com/TeddyRandby
#### Backend
- https://github.com/Thomas-Le

# License
MIT License

# Acknowledgements
- Project is for and is the idea of **Prof. Allen Hurlbert** @UNC who helped provide resources and guide our team along the way.
- **Jacob Yackenovich** @IBM for mentoring our team and providing guidance far and above just project direction.
- The team collecting data for https://github.com/ahhurlbert/aviandietdb, which is the basis of our project.
- **Prof. Jeff Terrell** @UNC for teaching and leading COMP 523, Software Engineering Lab.
