import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";

const UPDATE_PRODUCTS_MUTATION = `
mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        # Metafield fields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export default async function productUpdator(
    session,
  ) {
    const client = new shopify.api.clients.Graphql({ session });
  
    try {
      for (let i = 0; i < count; i++) {
        await client.query({
          data: {
            query: UPDATE_PRODUCTS_MUTATION,
            variables: {
                metafields: [
                    {
                      key: "<your-key>",
                      ownerId: "gid://shopify/Product/10079785100",
                      "type": "<your-type>",
                      "value": "<your-value>"
                    }
                  ]
            },
          },
        });
      }
    } catch (error) {
      if (error instanceof GraphqlQueryError) {
        throw new Error(
          `${error.message}\n${JSON.stringify(error.response, null, 2)}`
        );
      } else {
        throw error;
      }
    }
  }
  