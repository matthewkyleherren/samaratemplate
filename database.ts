import { createLocalDatabase } from '@tinacms/datalayer'
import { GitHubProvider } from 'tinacms-gitprovider-github'

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'

export default createLocalDatabase()
