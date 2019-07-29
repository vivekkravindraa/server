const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

app.get('/',(req,res) => {
    res.send({ "bye": "buddy" })
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);