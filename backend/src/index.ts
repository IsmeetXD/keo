import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))

import { authRouter } from './routes/auth.js'
import { boardsRouter } from './routes/boards.js'
import { membersRouter } from './routes/members.js'
import { groupsRouter } from './routes/groups.js'
import { tasksRouter } from './routes/tasks.js'

app.get('/', (c) => {
  return c.text('Keo API is running!')
})

app.route('/api/auth', authRouter)
app.route('/api/boards', boardsRouter)
app.route('/api/members', membersRouter)
app.route('/api/groups', groupsRouter)
app.route('/api/tasks', tasksRouter)

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

const port = 3001
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
