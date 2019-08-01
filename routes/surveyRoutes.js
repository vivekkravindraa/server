const _ = require('lodash');
const Path = require('path-parser');

// in case of path type error : enable below import
// const { Path } = require('path-parser');

const { URL } = require('url');
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');

const Survey = mongoose.model('surveys');

module.exports = app => {
    app.get('/api/surevys', requireLogin, async (req,res) => {
        const surveys = await Survey.find({ _user: req.user.id }).select({ recipients: false });
        res.send(surveys);
    })

    app.get('/api/surveys/:surveyId/:choice', (req,res) => {
        res.send('Thanks for voting!');
    })

    app.post('/api/surveys/webhooks', (req,res) => {
        // console.log(req.body);
        // res.send({})
        const p = new Path('/api/surveys/:surveyId/:choice');

        const events = _.chain(req.body)
        .map(({ email, url }) => {
            // console.log(p.test(new URL(url).pathname));
            const match = p.test(new URL(url).pathname);
            if(match) {
                return { email, surveyId: match.surveyId, choice: match.choice };
            }
        })
        .compact()
        .uniqBy('email', 'surveyId')
        .each(({ surveyId, email, choice }) => {
            Survey.updateOne({
                _id: surveyId,
                recipients: {
                    $elemMatch: { email: email, responded: false }
                }
            }, {
                $inc: { [choice]: 1 },
                $set: { 'recipients.$.responded': true },
                lastResponded: new Date()
            }).exec()
        })
        .value()
        
        console.log(events);
        res.send({})
    })

    app.post('/api/surveys', requireLogin, requireCredits, async (req,res) => {
        const { title, subject, body, recipients } = req.body;

        const survey = new Survey({
            title,
            subject,
            body,
            recipients: recipients.split(',').map(email => ({ email })),
            _user: req.user.id,
            dateSent: Date.now()
        });

        const mailer = new Mailer(survey, surveyTemplate(template));
        try {
            await mailer.send();
            await survey.save();
            req.user.credits -= 1;
            const user = await req.user.save();
            res.send(user);
        } catch(e) {
            res.status(422).send(e);
        }
    });
};