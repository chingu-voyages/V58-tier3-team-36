# voyage-tasks

Your project's `readme` is as important to success as your code. For
this reason you should put as much care into its creation and maintenance
as you would any other component of the application.

If you are unsure of what should go into the `readme` let this article,
written by an experienced Chingu, be your starting point -
[Keys to a well written README](https://tinyurl.com/yk3wubft).

And before we go there's "one more thing"! Once you decide what to include
in your `readme` feel free to replace the text we've provided here.

> Own it & Make it your Own!

## Team Documents

You may find these helpful as you work together to organize your project.

- [Team Project Ideas](./docs/team_project_ideas.md)
- [Team Decision Log](./docs/team_decision_log.md)

Meeting Agenda templates (located in the `/docs` directory in this repo):

- Meeting - Voyage Kickoff --> ./docs/meeting-voyage_kickoff.docx
- Meeting - App Vision & Feature Planning --> ./docs/meeting-vision_and_feature_planning.docx
- Meeting - Sprint Retrospective, Review, and Planning --> ./docs/meeting-sprint_retrospective_review_and_planning.docx
- Meeting - Sprint Open Topic Session --> ./docs/meeting-sprint_open_topic_session.docx

## Our Team

Everyone on your team should add their name along with a link to their GitHub
& optionally their LinkedIn profiles below. Do this in Sprint #1 to validate
your repo access and to practice PR'ing with your team _before_ you start
coding!

- Shruthi Reddy : [GitHub](https://github.com/shrusred) / [LinkedIn](https://www.linkedin.com/in/ssreddy/)
- Brandon Isaac Datch : [Github](https://github.com/Brandon-Isaac) / [LinkedIn](https://linkedin.com/in/isaac-datch-947067288)
- Frank Ndagula : [GitHub](https://github.com/Frank-128) / [LinkedIn](https://www.linkedin.com/in/fndagula/)

  ...

- Teammate name #n: [GitHub](https://github.com/ghaccountname) / [LinkedIn](https://linkedin.com/in/liaccountname)


### Running the Database Seed Script
Follow these instructions to populate your local development database with initial data, such as demographics, using the seed script.
- Node version >= 18 is required to run the seeding script
- NB: Invalid Timestamp returns a default of 01-01-2010
- Empty fields default to N/A

#### Seed Script Command
Use the following command to execute the seed script, which specifically populates demographics data:

```
npm run seed:demographics
```