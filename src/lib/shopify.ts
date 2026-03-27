import '@shopify/shopify-api/adapters/web-api'
import { shopifyApi, ApiVersion, LogSeverity } from '@shopify/shopify-api'

export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: ['read_customers', 'write_customers', 'read_orders', 'write_orders', 'read_products', 'write_script_tags', 'read_script_tags'],
  hostName: process.env.HOST!.replace(/https?:\/\//, ''),
  hostScheme: 'https',
  apiVersion: ApiVersion.January25,
  isEmbeddedApp: true,
  logger: {
    level: LogSeverity.Info,
  },
})
