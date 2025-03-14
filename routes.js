import usersRouter from './routes/users.js';
import bugsRouter from './routes/bugs.js';

const routes = {
    '/users': usersRouter,
    '/bugs': bugsRouter,
};

export default routes;
