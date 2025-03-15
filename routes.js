import usersRouter from './routes/users.js';
import bugsRouter from './routes/bugs.js';
import commentsRouter from './routes/comments.js';


const routes = {
    '/users': usersRouter,
    '/bugs': bugsRouter,
    '/comments': commentsRouter,
};

export default routes;
