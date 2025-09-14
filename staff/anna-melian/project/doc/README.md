# **TimeArt**⏳🖼️
Organize your tasks by assigning a specific time to each one. You can take breaks or extend the time if necessary, but try not to give up!

## Introduction

In **TimeArt**, your objective is to complete the set time you choose, destined to complete a task. Succed will reward you with collectible gems, while giving up might make you lose them! Your timers will be saved in your history so you can track your successes or failures.

While the timer is running, you’re allowed to take a few breaks with the time you’ve set. And once you complete your goal, you’ll be able to add extra time — just in case you want to keep your concentration strong. ⏳💎

![](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejVlYXg2OTYydHd6enZyNGIxY2lqM2pka2xpOHh1OHF5Y211eGJtMyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/QdVmkR04rz7vbT3cx9/giphy.gif)

## Functional

### Use Cases

User:
- Register
- Login
- Logout
- Create timer with a inital maxim duration of 120 minuts
- Pause timer with the previously set time up to 10 minutes, allowing a maximum of 8 pasues (Timer page ⏳)
- Add extra time allowed since the total time (initial set time + extra time) is under 240 minutes (Timer page ⏳)
- Exit the timer (Timer page ⏳)
- See your session history, which contains information about all past timers (Session history page 📄)


**In for future development:**

- Modified user data (Settings page ⚙️)
- Change the notifications and sound configuration (Settings page ⚙️)
- Updated session history with search filters (Session history page 📄)


### UIUX Design

[Figma](https://www.figma.com/design/YfTD4MKUYzOHxIqSH9r5Pv/project?node-id=0-1&p=f&t=4y7xdnbETfRC80AU-0)

## Technical

### Blocks

- App
- API
- Database

### Packages

- app (...)
- api (...)
- com (...)

### Data Model

#### User

- id string (string, uuid)
- name (string, min length 1, max length 20)
- email (string, max length 30)
- username (string, min length 3, max length 20)
- password (string, min length 8, max length 20)
- createdAt (Date)
- modifiedAt (Date, optional)
- gems (number, min 0)


#### Timer

- id (string, uuid)
- author (ObjectId,User.id)
- time (number, max 120, min 5)
- startDate (Date)
- endDate (Date)
- status (string, enum: created | active | exit | pause | extraTime | end )
- pauseTime (number, max 10, min 2)
- pausesCount (number, max 8)
- extraTimes (array of number, max 120, min 5)
- tag(string, max length)
- createdAt (Date)



### Technologies

- HTML / CSS / JS
- React / Vite, TailwindCSS
- Express / Node.js
- Mocha + Chai
- MongoDb / Mongoose
- jwt
- bcrypt

### Code Coverage

[Code coverage](http://127.0.0.1:5500/staff/anna-melian/project/api/coverage/index.html)
## Planning

[Issue Tracking](https://github.com/b00tc4mp/isdi-bootcamp-202501/issues/84)