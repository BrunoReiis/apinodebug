import usersRouter from './routes/users.js';
import bugsRouter from './routes/bugs.js';
import commentsRouter from './routes/comments.js';
import historychangeRouter from './routes/historychange.js';

const routes = {
    '/users': usersRouter,
    '/bugs': bugsRouter,
    '/comments': commentsRouter,
    '/historychange': historychangeRouter,
};

export default routes;
