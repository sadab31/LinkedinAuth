const passport = require("passport");
const LinkedInOAuth = require("passport-linkedin-oauth2");
const session = require("express-session");
const express = require("express");
const CONSTANTS = require("./constants");

//Create a new Express App
const app = express();

//Serialize/Deserialize User
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

//MIDDLEWARES

//Create a Session
app.use(session({ secret: "Sadab" }));

//Initialize passport
app.use(passport.initialize());

//Create a passport session
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const LinkedInStrategy = LinkedInOAuth.Strategy;

const LINKEDIN_CLIENTID = "86ngfn3w5cipdt";
const LINKEDIN_CLIENTSECRET = "Ae1AmkVeaX8F3Dr2";

console.log("CLIENT ID", LINKEDIN_CLIENTID);

const LINKEDIN_STRATEGY_OBJECT = {
  clientID: LINKEDIN_CLIENTID,
  clientSecret: LINKEDIN_CLIENTSECRET,
  callbackURL: `http://127.0.0.1:8000/auth/linkedin/callback`,
  scope: CONSTANTS.linkedInScopes,
};

passport.use(
  new LinkedInStrategy(
    LINKEDIN_STRATEGY_OBJECT,
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => {
        return done(null, profile);
      });
    }
  )
);

app.get(
  CONSTANTS.authUrl,
  passport.authenticate(CONSTANTS.strategy, { state: "" })
);

app.get(
  CONSTANTS.callbackUrl,
  passport.authenticate(CONSTANTS.strategy, {
    successRedirect: CONSTANTS.successUrl,
    failureRedirect: CONSTANTS.failureUrl,
  })
);

app.get("/", (req, res) => {
  console.log("Dhukse");
  const user = req.user;
  if (user) {
    console.log(user.emails[0].value);
    const firstName = user.name.givenName;
    const photo = user.photos[0].value;
    res.send(
      `<div style="text-align:center; width:100%; margin: 200px 0px;">
          <h1 style="font-family: sans-serif;"> Hey ${firstName} 👋</h1>
          <p style="font-family: sans-serif;"> You've successfully logged in with your Linkedn Account 👏 </p>
          <img src="${photo}"/>
        </div>
        `
    );
  } else {
    res.send(
      `<div style="text-align:center; width:100%; margin: 200px 0px;">
            <h1 style="font-family: sans-serif;">Welcome to LinkedIn OAuth App</h1>
            <img style="cursor:pointer;margin-top:20px"  onclick="window.location='/auth/linkedIn'" src="https://dryfta.com/wp-content/uploads/2017/04/Linkedin-customized-button.png"/>
      </div>
      `
    );
  }
});

app.listen(CONSTANTS.PORT);
