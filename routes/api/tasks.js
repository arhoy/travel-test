const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

// import required db models
const User = require('../../models/User');
const Task = require('../../models/Task');


// Type          :  GET
// Route         :  api/task
// Description   :  get all tasks for that user
// Access:       :  Only logged in user can see his tasks
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').populate('tasks');
        res.json(user.tasks);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('There as a server error');
    }
})



// Type          :  POST
// Route         :  api/tasks
// Description   :  user adds ToDo task for themselves
// Access:       :  User can add task for himself
router.post(
        '/',
         auth,
         [
            check('text')
                .not().isEmpty()
                .withMessage('ToDo text is required!')
                .isLength({min:1,max:255})
                .withMessage('To Do description must be between 1 and 255 characters!')
         ],
        async (req, res) => {
        
            // check express-validation
            const errors = validationResult(req);
            if( !errors.isEmpty() ) {
      
               
                return res.status(400).json({ errors: errors.array() })
            } 

            try {
                const user = await User.findById(req.user.id).select('-password');

                if( !user ){
                    res.status(400).send('User was not found');
                } else {

                    
                    // create a new task
                const task = new Task({
                    text: req.body.text,
                    created_user: req.user.id
                })

                // save task in Task db
                await task.save();

                // add task to user and save
                user.tasks.unshift(task);
                await user.save();
                // response is the new task.
                res.json(task);

                }
            } catch (error) {
                console.error(error.message);
                res.status(500).send('There as a server error');
            }
})

// Type          :  PUT
// Route         :  api/tasks/:taskId
// Description   :  Edit the task 
// Access:       :  User can edit his task
router.put(
        '/:taskId', 
        auth, 
        [
            check('text')
                .not().isEmpty()
                .withMessage('ToDo text is required!')
                .isLength({min:1,max:255})
                .withMessage('To Do description must be between 1 and 255 characters!')
         ],
        async (req,res) => {
            console.log('this is being called!');
            // check express-validation
            const errors = validationResult(req);
            if( !errors.isEmpty() ) {
                console.log('wtf')
                return res.status(400).json({ errors: errors.array() })
            } 

            // get the new fields: 

            const taskFields = {};
            taskFields.id = req.params.taskId;
            taskFields.user = req.user.id;
            if(req.body.text) taskFields.text = req.body.text;

            try {
                const user = await User.findById(req.user.id).select('-password');

                if( !user ){
                   return res.status(400).send('User was not found');
                } 

                const checkTask = await Task.findById(req.params.taskId); 

                if( !checkTask ) {
                    return res.status(404).json({msg: 'Task was not found!' })
                }

                const task = await Task.findByIdAndUpdate(
                    req.params.taskId,
                    {$set: taskFields },
                    { new: true }
                );
                
                //save new task;
                await task.save();

                // update user task and send back response
                res.json(task);

            } catch (error) {
                console.error(error.message);
                res.status(500).send('There as a server error');
            }
})

// Type          :  PUT
// Route         :  api/tasks/status/:taskId
// Description   :  Change the completion status of the task 
// Access:       :  User must be loggedin
router.put(
    '/status/:taskId', 
    auth, 
    async (req,res) => {
        
         try {
            const user = await User.findById(req.user.id).select('-password');

            if( !user ){
               return res.status(400).send('User was not found');
            } 

            const checkTask = await Task.findById(req.params.taskId); 

            if( !checkTask ) {
                return res.status(404).json({msg: 'Task was not found!' })
            }

            // update the status by cycling through
            let { status } = req.body;
            console.log(status);

            switch( status ) {
                case 'not completed':
                    status = 'in progress';
                    completed = false;
                    break;
                case 'in progress':
                    status = 'completed';
                    completed = true
                    break;
                case 'completed':
                    status = 'not completed';
                    completed = false;
                    break;
                default:
                    status = 'not completed';
            }
       
            const task = await Task.findByIdAndUpdate(
                req.params.taskId,
                {'completed': completed, 'status': status },
                { new: true }
            );
        
            //save new task;
            await task.save();

            // update user task and send back response
            res.json(task);

        } catch (error) {
            console.error(error.message);
            res.status(500).send('There as a server error');
        }
})



// Type          :  DELETE
// Route         :  api/tasks/:taskId
// Description   :  Delete the task 
// Access:       :  User must be loggedin
router.delete('/:taskId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if( !user ){
            res.status(400).send('User was not found');
        } else {

           // Find the Task to delete
           const task = await Task.findById(req.params.taskId);
           if( !task ) {
               return res.status(404).json({msg:'Could not delete task, task not found!'})
           }

           // remove task from the task database
           await task.remove();

           // remove task from the user database also.
           const removeIndex = user.tasks.map( task => task.id).indexOf(req.params.taskId);
           user.tasks.splice(removeIndex,1);

           // save updated user.
           await user.save();

           // response to send back
           res.json({msg: 'Task was removed!'});

        }

    } catch (error) {
        console.error(error.message);
        res.status(500).send('There as a server error');
    }
})



module.exports = router;