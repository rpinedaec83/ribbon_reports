/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const LogoutController = () => import('#controllers/auth/logout_controller')
const LoginController = () => import('#controllers/auth/login_controller')
import TrunksController from '#controllers/trunks_controller'
import UploadsController from '#controllers/uploads_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import ReportsController from '#controllers/reports_controller'
const RegisterController = () => import('../app/controllers/auth/register_controller.js')
const DashboardController = () => import('#controllers/dashboard_controller')

router
  .get('/', async (ctx) => {
    await ctx.auth.check()
    return ctx.view.render('pages/dashboard')
  })
  .use(middleware.auth())

router.get('/dashboard', [DashboardController, 'index']).as('dashboard').use(middleware.auth())

router
  .group(() => {
    router.get('/register', [RegisterController, 'show']).as('register.show')
    router.post('/register', [RegisterController, 'store']).as('register.store')

    router.get('/login', [LoginController, 'show']).as('login.show')
    router.post('/login', [LoginController, 'store']).as('login.store')

    router.post('/logout', [LogoutController, 'handle']).as('logout')
  })
  .as('auth')

router
  .group(() => {
    router.get('/', [TrunksController, 'index']).as('TrunksController.index')
    router.post('/', [TrunksController, 'store']).as('TrunksController.store')
    router.get('/:id', [TrunksController, 'show']).as('TrunksController.show')
    router.delete('/:id', [TrunksController, 'destroy']).as('TrunksController.destroy')
  })
  .prefix('/trunks')
  .use(middleware.auth())

router
  .get('/report', [ReportsController, 'index'])
  .as('ReportsController.index')
  .use(middleware.auth())
router.get('/report/data', [ReportsController, 'data']).as('ReportsController.data') // AJAX DataTable
router.get('/report/filters', [ReportsController, 'filters']).as('ReportsController.filters')
router.get('/report/totales',[ReportsController, 'totales']).as('ReportsController.totales')
router.post('/report/delete-by-date', [ReportsController, 'deleteByDate']).as('ReportsController.deleteByDate')

router.post('/upload', [UploadsController, 'store']).as('UploadsController.store')
router
  .get('/upload', [UploadsController, 'show'])
  .as('UploadsController.show')
  .use(middleware.auth())
