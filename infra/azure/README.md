# Optional Azure deployment

The application runs locally without Azure. This directory documents a small deployment path for the checked-in Node build.

## Included

- Bicep template for Linux Azure App Service.
- HTTPS-only configuration, disabled FTP, HTTP/2 and a health-check path.
- F1 as the default demonstration SKU; availability and quotas depend on the Azure subscription.
- A manually triggered GitHub Actions workflow.
- An Azure Pipelines build definition at the repository root.

## Deploy with Azure CLI

```bash
az login
az group create --name service-portal-demo --location westeurope
az deployment group create \
  --resource-group service-portal-demo \
  --template-file infra/azure/main.bicep \
  --parameters infra/azure/main.bicepparam
```

Build the application before packaging it for App Service:

```bash
npm install
npm run build
zip -r service-portal.zip dist public data api package.json
az webapp deploy \
  --resource-group service-portal-demo \
  --name <name-from-bicep-output> \
  --src-path service-portal.zip \
  --type zip
```

Do not add subscription identifiers, publish profiles, connection strings or database passwords to the repository. MySQL is intentionally excluded from the default template because an Azure Database for MySQL deployment can incur charges. The local Docker profile remains the no-account database option.
