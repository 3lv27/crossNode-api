'use strict'

// Container for all the environments
let environments = {}

// Staging (default) environment
environments.staging = {
  'httpPort': 4000,
  'httpsPort': 4001,
  'envName': 'staging'
}

// Production environment
environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production'
}

// Determine which environment was passed as a comandline argument
const currentEnvironment = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLocaleLowerCase() : ''

// Check if the current environment is one of the above, if not, default to staging
const environmentToExport = typeof (environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging

module.exports = environmentToExport