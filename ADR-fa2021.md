## Architecture Decision Records

Since our work will be built off of substantial work from prior semesters on the Avian Diet Database, many of the application architecture decisions are already defined (see prior at ADR.md). We have decided to maintain the current architecture while building out new features for the semester because:

- The rationale within their ADR remains sound
- There is no conflict between maintaining existing architecture and adding desired features
- No major benefits would arise from reworking the architecture surrounding the web app, and thus it is best to focus our time working on needed features

However, we have some ADRs related to our planned features:

### Diet Database Data Entry Flow

**Summary**: In order to update the Avian Diet Database with new data submissions, we decided to directly add new entries into the existing MySQL database.

**Problem**: Currently, the Avian Diet Database stores all of its data in one large Excel flat file and uses a cron job to update the website every so often. Users may make contributions to the flat file through GitHub, which requires technical knowledge on version control. The current database entry flow is quite complex for the non-tech savvy individual, and thus presents a potential barrier for many people to contribute to the Avian Diet Database. Since the main mission of the website is to have a standardized database on scientific avian diet data, this barrier for potential contributors is detrimental to the growth of the database.

**Constraints**: Existing data is stored in a specific format with specific fields that we must adhere to.

**Options**:
- Phase out the Excel flat file and directly add new entries into the MySQL database that the cron job pushes the data from the flat file to.
-- Pros: Quicker, simplified data pipeline
-- Cons: Must phase out and remove old, unnecessary code
- Maintain the Excel flat file, and append new entries to the flat file
-- Pros: May be simpler; doesn’t manipulate existing functionality
-- Cons: Leaves unnecessary step in the data pipeline

**Rationale**: Since maintaining the Excel flat file would provide a simple backup method that Professor Hurlbert is comfortable with using, we decided to go with this method.

### Authentication Method

**Summary**
In order to build in an authentication method, we decided to use JWT’s in a custom-built auth solution.

**Problem**
The main feature that is needed is a convenient UI for users to submit avian diet data. However, data submission requires some sort of authentication method to allow submissions to be traced back to a specific user. If there is no authentication required for data submission, then random users can potentially anonymously abuse the submission portal without any way to stop it. With the addition of user authentication, a feature to block ill-intentioned users may be added in the future, along with the ability to create distinct Admin and User roles. The User only has privilege to make submissions, while the Admin may review and accept or decline submissions.

**Constraints** 
The client does not want to use any authentication method that requires the user to make an account on another platform (ex. Integrated Google sign-in).

**Options**
- Firebase Auth:
-- Pros: clearly and concisely documented; guaranteed to be secure since it’s an established and trusted service; fairly simple to set up once Firebase is integrated with the web app
-- Cons: requires creating and maintaining an additional account through Firebase; Firebase is not currently integrated with the web app, and we don’t need to use any other Firebase features
- Custom-built auth:
-- Pros: stores user data in JSON, so requires less database queries for user data; relatively quick and simple to develop; many tutorials available online
-- Cons: teammates aren’t familiar with building authentication from scratch; lack of familiarity may lead to security loopholes

**Rationale**
We chose to implement custom-built authentication, since we won’t have the extra overhead of maintaining a Firebase account, and it fulfills the client’s desire for a custom solution that doesn’t rely on another platform. Hashing and salting using bcrypt will be used to secure passwords.

### Git Workflow

**Summary**
In order to define a specific Git Workflow for the team, we decided to discuss as a team what makes the most sense for the project and what we’re most comfortable with.

**Problem**
Since our team needs the flexibility of developing multiple features simultaneously in parallel, we must use some form of version control. We will be using Git since that is where the prior code is held. The effective use of Git requires a specific set workflow and conventions that are understood across the team, both to allow for conflict-free collaboration, but also to ensure a clean and understandable working history.

**Constraints**
None

**Options**
- Continue using OneFlow, which was used in a prior semester
-- Pros: cleaner project history; simple one-branch system based off of master
-- Cons: risky as local branches may lose changes; not suitable for large features because of risk of disk failure/accidents during the middle of developing the feature
- Use common Gitflow workflow, custom tailored to the team’s needs/opinions: Check out a new branch per task with naming [author name] – [task name], open a pull request to be approved by another member, then merge to master
-- Pros: feature branches are held remotely, so risk of data loss is minimal; easily track features and contributors
-- Cons: more complicated project history

**Rationale**
We decided to use the Gitflow workflow since we wanted the extra safety of maintaining feature branches remotely instead of just locally, especially because some of our larger features may take awhile to complete.
