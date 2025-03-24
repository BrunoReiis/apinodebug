import usersRouter from './routes/users.js';
import bugsRouter from './routes/bugs.js';
import commentsRouter from './routes/comments.js';
import historychangeRouter from './routes/historychange.js';
import teamsRouter from './routes/teams.js'
import projectsRouter from './routes/projects.js'

const routes = {
    '/users': usersRouter,
    '/bugs': bugsRouter,
    '/comments': commentsRouter,
    '/historychange': historychangeRouter,
    '/teams': teamsRouter,
    '/projects': projectsRouter,
};

export default routes;
