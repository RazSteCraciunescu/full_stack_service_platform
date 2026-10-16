targetScope = 'resourceGroup'

@description('Short name used to build Azure resource names.')
@minLength(3)
@maxLength(24)
param workloadName string = 'service-portal'

@description('Azure region for the App Service resources.')
param location string = resourceGroup().location

@description('App Service plan SKU. F1 is appropriate for a small demonstration deployment.')
@allowed([
  'F1'
  'B1'
])
param appServiceSku string = 'F1'

@description('Node runtime exposed by Azure App Service.')
param linuxFxVersion string = 'NODE|22-lts'

var suffix = uniqueString(subscription().subscriptionId, resourceGroup().id, workloadName)
var appName = take(toLower('${workloadName}-${suffix}'), 60)
var planName = '${workloadName}-plan-${suffix}'

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: planName
  location: location
  kind: 'linux'
  sku: {
    name: appServiceSku
    tier: appServiceSku == 'F1' ? 'Free' : 'Basic'
    size: appServiceSku
    capacity: 1
  }
  properties: {
    reserved: true
  }
}

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: appName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    clientAffinityEnabled: false
    siteConfig: {
      linuxFxVersion: linuxFxVersion
      appCommandLine: 'node dist/server/src/server.js'
      alwaysOn: appServiceSku != 'F1'
      ftpsState: 'Disabled'
      http20Enabled: true
      minTlsVersion: '1.2'
      healthCheckPath: '/api/health'
      appSettings: [
        { name: 'NODE_ENV', value: 'production' }
        { name: 'HOST', value: '0.0.0.0' }
        { name: 'WEBSITE_NODE_DEFAULT_VERSION', value: '~22' }
        { name: 'SCM_DO_BUILD_DURING_DEPLOYMENT', value: 'false' }
      ]
    }
  }
}

output webAppName string = webApp.name
output defaultHostName string = webApp.properties.defaultHostName
output applicationUrl string = 'https://${webApp.properties.defaultHostName}'
