const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateProfileInputs = require('../../validation/profile');
const validateExperinceInputs = require('../../validation/experince');
const validateEducationInputs = require('../../validation/education');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route    GET api/profile/test
//@des      Test profile routes
//@access   Public
router.get('/test', (req, res) => res.json({ msg: 'Pofile works...' }));

//@route    GET api/profile/
//@des      Get current user profile
//@access   Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
        .populate('user', 'name')
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user'
                return res.status(404).json(errors)
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});

//@route    GET api/profile/all
//@des      Get all profiles
//@access   Public
router.get('/all', (req, res) => {
    Profile.find()
    .populate('user', 'name')
    .then(profiles => {
        if(!profiles) {
            errors.noprofile = 'There are no profile';
            return res.status(404).json(errors)
        }
        res.json(profiles);
    })
    .catch(err => res.status(4004).json(err));
});

//@route    GET api/profile/handle/:handle
//@des      Get profile by handle
//@access   Public
router.get('/handle/:handle', (req, res) => {
    const errors = {};
    Profile.findOne({ handle: req.params.handle })
    .populate('user', 'name')
    .then(profile => {
        if(!profile) {
            errors.noprofile = 'There is no Profile for this user';
            return res.status(404).json(errors)
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

//@route    GET api/profile/user/:user_id
//@des      Get profile by user ID
//@access   Public
router.get('/user/:user_id', (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.params.user_id })
    .populate('user', 'name')
    .then(profile => {
        if(!profile) {
            errors.noprofile = 'There is no Profile for this user';
            return res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json(err));
})

//@route    POST api/profile/
//@des      Create or edit user profile
//@access   Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateProfileInputs(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    // get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.bio) profileFields.bio = req.body.bio;
    if(req.body.status) profileFields.status = req.body.status;
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
    
    // Skills split in to arrays
    if(typeof req.body.skills !== undefined) {
        profileFields.skills = req.body.skills.split(',');
    }

    // Social
    profileFields.social = {};
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.instargram) profileFields.social.instargram = req.body.instargram;

    Profile.findOne({ user: req.user.id })
     .then(profile => {
         // Update
         if(profile) {
            Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            ).then(profile => res.json(profile));
         } else {
        // Create
        
        // Check if handle exists
         Profile.findOne({ handle : profileFields.handle }).then(profile => {
            if(profile) {
                errors.handle = "That handle is already exists";
                res.status(400).json(errors);
            }
            new Profile(profileFields).save().then(profile => res.json(profile));
         })
        }
     })
});

//@route    POST api/profile/experince
//@des      Add experince to profile
//@access   Private
router.post('/experince', passport.authenticate('jwt', { session: false }), (req, res) => {
    // const errors  = {};
    const { errors, isValid } = validateExperinceInputs(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id })
     .then(profile => {
         const newExp = {
             title: req.body.title,
             company: req.body.company,
             location: req.body.location,
             from: req.body.from,
             to: req.body.to,
             current: req.body.current,
             description: req.body.description
         }
         //Add to exp array
         profile.experince.unshift(newExp);
         profile.save().then(profile => res.json(profile)); 
     })
});

//@route    POST api/profile/education
//@des      Add education to profile
//@access   Private
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateEducationInputs(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
     .then(profile => {
        const newEdu = {
            school: req.body.school,
            degree: req.body.degree,
            fieldofStudy: req.body.fieldofStudy,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        };
        profile.education.unshift(newEdu);
        profile.save().then(profile => res.json(profile));
     })
})

//@route    DELETE api/profile/experince/:exp_id
//@des      Delete experince from profile
//@access   Private
router.delete('/experince/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
     .then(profile => {
         // Get remove index
         const removeIndex = profile.experince
         .map(item => item.id)
         .indexOf(req.params.exp_id);

         // Splice out array
         profile.experince.splice(removeIndex, 1);

         // Save profile
         profile.save().then(profile => res.json(profile));
     })
     .catch(err => res.status(404).json(err));
})

//@route    DELETE api/profile/education/:edu_id
//@des      Delete education from profile
//@access   Private
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
     .then(profile => {
         const removeIndex = profile.education
         .map(item => item.id)
         .indexOf(req.params.edu_id);

         profile.education.splice(removeIndex, 1);
         profile.save().then(profile => res.json(profile));
     })
     .catch(err => res.status(404).json(err));
});

//@route    DELETE api/profile
//@des      Delete user and profile
//@access   Private
router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
        User.findOneAndRemove({ _id: req.user.id }).then(() => 
            res.json({ success: true })
        );
    })
})

module.exports = router;